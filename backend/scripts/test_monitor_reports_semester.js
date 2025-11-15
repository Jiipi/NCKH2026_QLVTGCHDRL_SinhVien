/**
 * Script kiểm tra filter học kỳ trong báo cáo lớp trưởng
 * Chạy: node backend/scripts/test_monitor_reports_semester.js [classId|ten_lop] [semester]
 * 
 * Ví dụ:
 *   node backend/scripts/test_monitor_reports_semester.js ATTT01-2021 hoc_ky_1-2025
 */

const { PrismaClient } = require('@prisma/client');
const { buildRobustActivitySemesterWhere, parseSemesterString } = require('../src/core/utils/semester');
const MonitorService = require('../src/modules/monitor/monitor.service');

const prisma = new PrismaClient();

// Helper: detect UUID v4-ish (basic check)
function looksLikeUUID(s) {
  return typeof s === 'string' && /^[0-9a-fA-F-]{36}$/.test(s);
}

async function resolveClass(input) {
  // Try by UUID id first (fast path)
  if (looksLikeUUID(input)) {
    try {
      const byId = await prisma.lop.findUnique({ where: { id: input }, select: { id: true, ten_lop: true } });
      if (byId) return byId;
    } catch (_) {}
  }

  // Try by exact ten_lop
  const exact = await prisma.lop.findUnique({ where: { ten_lop: input }, select: { id: true, ten_lop: true } }).catch(() => null);
  if (exact) return exact;

  // Try contains (best-effort when user passes partial)
  const fuzzy = await prisma.lop.findFirst({ where: { ten_lop: { contains: input } }, select: { id: true, ten_lop: true } });
  if (fuzzy) return fuzzy;

  return null;
}

async function testMonitorReportsSemester(classId, semester) {
  try {
    console.log('\n🔍 KIỂM TRA FILTER HỌC KỲ TRONG BÁO CÁO LỚP TRƯỞNG\n');
    console.log(`Lớp: ${classId}`);
    console.log(`Học kỳ: ${semester}\n`);

    // 1. Parse semester
    const semesterInfo = parseSemesterString(semester);
    console.log('📋 Thông tin học kỳ:');
    console.log('   ', JSON.stringify(semesterInfo, null, 2));

    // 2. Build filter
    const activityFilter = buildRobustActivitySemesterWhere(semester);
    console.log('\n🔧 Filter được tạo:');
    console.log('   ', JSON.stringify(activityFilter, null, 2));

    // 3. Tìm lớp (chấp nhận UUID hoặc tên lớp)
    const lop = await resolveClass(classId);
    if (!lop) {
      console.error(`❌ Không tìm thấy lớp theo id/ten_lop: ${classId}`);
      return;
    }

    console.log(`\n✅ Tìm thấy lớp: ${lop.ten_lop}`);

    // 4. Lấy báo cáo từ service
    console.log('\n📊 Lấy báo cáo từ MonitorService...');
    const report = await MonitorService.getClassReports(lop.id, { semester });
    
    console.log('\n📈 Kết quả báo cáo:');
    console.log('   Tổng sinh viên:', report.overview.totalStudents);
    console.log('   Tổng hoạt động:', report.overview.totalActivities);
    console.log('   Điểm TB:', report.overview.avgPoints);
    console.log('   Tỷ lệ tham gia:', report.overview.participationRate + '%');

    // 5. Kiểm tra dữ liệu thô từ database
    console.log('\n🔍 Kiểm tra dữ liệu thô từ database...');
    
    // Lấy tất cả đăng ký của lớp
    const allRegs = await prisma.dangKyHoatDong.findMany({
      where: {
        sinh_vien: { lop_id: lop.id }
      },
      include: {
        hoat_dong: {
          select: {
            id: true,
            ten_hd: true,
            hoc_ky: true,
            nam_hoc: true,
            diem_rl: true,
            ngay_bd: true,
            trang_thai: true
          }
        },
        sinh_vien: {
          select: {
            mssv: true,
            nguoi_dung: { select: { ho_ten: true } }
          }
        }
      }
    });

    console.log(`\n   Tổng số đăng ký của lớp: ${allRegs.length}`);

    // Nhóm theo học kỳ
    const bySemester = {};
    allRegs.forEach(reg => {
      const key = `${reg.hoat_dong?.hoc_ky || 'N/A'}_${reg.hoat_dong?.nam_hoc || 'N/A'}`;
      if (!bySemester[key]) {
        bySemester[key] = {
          hoc_ky: reg.hoat_dong?.hoc_ky,
          nam_hoc: reg.hoat_dong?.nam_hoc,
          count: 0,
          da_duyet: 0,
          activities: new Set()
        };
      }
      bySemester[key].count++;
      if (reg.trang_thai_dk === 'da_duyet') {
        bySemester[key].da_duyet++;
        if (reg.hoat_dong?.id) {
          bySemester[key].activities.add(reg.hoat_dong.id);
        }
      }
    });

    console.log('\n   Phân bố theo học kỳ:');
    Object.keys(bySemester).sort().forEach(key => {
      const data = bySemester[key];
      const isTarget = data.hoc_ky === semesterInfo.semester && 
                      (data.nam_hoc === `${semesterInfo.year}-${parseInt(semesterInfo.year) + 1}` ||
                       data.nam_hoc === `${semesterInfo.year} - ${parseInt(semesterInfo.year) + 1}` ||
                       (data.nam_hoc && data.nam_hoc.includes(semesterInfo.year)));
      
      console.log(`   ${isTarget ? '✅' : '  '} ${key}:`);
      console.log(`      - Tổng đăng ký: ${data.count}`);
      console.log(`      - Đã duyệt: ${data.da_duyet}`);
      console.log(`      - Số hoạt động: ${data.activities.size}`);
    });

    // 6. Kiểm tra filter có đúng không
    console.log('\n✅ Kiểm tra filter:');
    const targetSemesterKey = `${semesterInfo.semester}_${semesterInfo.year}-${parseInt(semesterInfo.year) + 1}`;
    const targetData = bySemester[targetSemesterKey] || 
                      Object.values(bySemester).find(d => 
                        d.hoc_ky === semesterInfo.semester && 
                        (d.nam_hoc && d.nam_hoc.includes(semesterInfo.year))
                      );

    if (targetData) {
      console.log(`   Học kỳ được chọn: ${targetSemesterKey}`);
      console.log(`   Số hoạt động trong báo cáo: ${report.overview.totalActivities}`);
      console.log(`   Số hoạt động thực tế: ${targetData.activities.size}`);
      
      if (report.overview.totalActivities === targetData.activities.size) {
        console.log('   ✅ KHỚP! Filter hoạt động đúng.');
      } else {
        console.log('   ⚠️  KHÔNG KHỚP! Có thể có vấn đề với filter.');
        console.log(`   Chênh lệch: ${Math.abs(report.overview.totalActivities - targetData.activities.size)}`);
      }
    } else {
      console.log('   ⚠️  Không tìm thấy dữ liệu cho học kỳ được chọn trong database.');
    }

    console.log('\n✅ Hoàn thành kiểm tra!\n');

  } catch (error) {
    console.error('❌ Lỗi:', error);
    console.error(error.stack);
  } finally {
    await prisma.$disconnect();
  }
}

// Main
const classId = process.argv[2];
const semester = process.argv[3] || 'hoc_ky_1-2025';

if (!classId) {
  console.error('❌ Vui lòng cung cấp classId');
  console.error('   Usage: node test_monitor_reports_semester.js [classId] [semester]');
  process.exit(1);
}

testMonitorReportsSemester(classId, semester);

