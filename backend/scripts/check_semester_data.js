/**
 * Script kiểm tra dữ liệu theo từng học kỳ
 * Kiểm tra xem dữ liệu HK1 2025-2026 có đúng không và các học kỳ khác
 * Usage: node scripts/check_semester_data.js
 */

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkSemesterData() {
  const mssv = '202101002';
  
  try {
    console.log('='.repeat(100));
    console.log('🔍 KIỂM TRA DỮ LIỆU THEO HỌC KỲ - SINH VIÊN:', mssv);
    console.log('='.repeat(100));
    
    // 1. Tìm sinh viên
    const sinhVien = await prisma.sinhVien.findUnique({
      where: { mssv },
      include: {
        nguoi_dung: {
          select: {
            id: true,
            ho_ten: true
          }
        },
        lop: {
          select: {
            id: true,
            ten_lop: true,
            chu_nhiem: true
          }
        }
      }
    });
    
    if (!sinhVien) {
      console.error('❌ Không tìm thấy sinh viên');
      return;
    }
    
    console.log('\n📋 THÔNG TIN SINH VIÊN:');
    console.log('   - MSSV:', sinhVien.mssv);
    console.log('   - Họ tên:', sinhVien.nguoi_dung.ho_ten);
    console.log('   - Lớp:', sinhVien.lop?.ten_lop);
    
    // 2. Lấy class creators
    const classStudents = await prisma.sinhVien.findMany({
      where: { lop_id: sinhVien.lop_id },
      select: { nguoi_dung_id: true }
    });
    const classCreatorUserIds = classStudents.map(s => s.nguoi_dung_id).filter(Boolean);
    if (sinhVien.lop?.chu_nhiem) {
      classCreatorUserIds.push(sinhVien.lop.chu_nhiem);
    }
    
    console.log('\n👥 CLASS CREATORS:', classCreatorUserIds.length);
    
    // 3. Lấy TẤT CẢ đăng ký, nhóm theo học kỳ
    const allRegistrations = await prisma.dangKyHoatDong.findMany({
      where: {
        sv_id: sinhVien.id
      },
      include: {
        hoat_dong: {
          include: {
            loai_hd: {
              select: {
                ten_loai_hd: true,
                diem_toi_da: true
              }
            },
            nguoi_tao: {
              select: {
                id: true,
                ho_ten: true,
                ten_dn: true
              }
            }
          }
        }
      }
    });
    
    // Nhóm theo học kỳ
    const bySemester = {};
    
    allRegistrations.forEach(reg => {
      const hd = reg.hoat_dong;
      const semesterKey = `${hd.hoc_ky}_${hd.nam_hoc || 'N/A'}`;
      
      if (!bySemester[semesterKey]) {
        bySemester[semesterKey] = {
          hoc_ky: hd.hoc_ky,
          nam_hoc: hd.nam_hoc,
          registrations: [],
          attendances: []
        };
      }
      
      const isClassActivity = classCreatorUserIds.includes(hd.nguoi_tao?.id);
      
      bySemester[semesterKey].registrations.push({
        id: reg.id,
        hd_id: hd.id,
        ten_hd: hd.ten_hd,
        trang_thai_dk: reg.trang_thai_dk,
        diem_rl: parseFloat(hd.diem_rl || 0),
        loai_hd: hd.loai_hd?.ten_loai_hd,
        nguoi_tao: hd.nguoi_tao?.ho_ten || hd.nguoi_tao?.ten_dn || 'Unknown',
        nguoi_tao_id: hd.nguoi_tao?.id,
        isClassActivity
      });
    });
    
    // 4. Lấy TẤT CẢ điểm danh, nhóm theo học kỳ
    const allAttendances = await prisma.diemDanh.findMany({
      where: {
        sv_id: sinhVien.id,
        xac_nhan_tham_gia: true
      },
      include: {
        hoat_dong: {
          include: {
            loai_hd: {
              select: {
                ten_loai_hd: true
              }
            },
            nguoi_tao: {
              select: {
                id: true
              }
            }
          }
        }
      }
    });
    
    allAttendances.forEach(att => {
      const hd = att.hoat_dong;
      const semesterKey = `${hd.hoc_ky}_${hd.nam_hoc || 'N/A'}`;
      
      if (!bySemester[semesterKey]) {
        bySemester[semesterKey] = {
          hoc_ky: hd.hoc_ky,
          nam_hoc: hd.nam_hoc,
          registrations: [],
          attendances: []
        };
      }
      
      const isClassActivity = classCreatorUserIds.includes(hd.nguoi_tao?.id);
      
      bySemester[semesterKey].attendances.push({
        id: att.id,
        hd_id: hd.id,
        ten_hd: hd.ten_hd,
        diem_rl: parseFloat(hd.diem_rl || 0),
        loai_hd: hd.loai_hd?.ten_loai_hd,
        isClassActivity
      });
    });
    
    // 5. Tính điểm và phân tích từng học kỳ
    console.log('\n' + '='.repeat(100));
    console.log('📊 PHÂN TÍCH THEO TỪNG HỌC KỲ:');
    console.log('='.repeat(100));
    
    const semesterKeys = Object.keys(bySemester).sort();
    
    for (const semesterKey of semesterKeys) {
      const data = bySemester[semesterKey];
      console.log(`\n📅 HỌC KỲ: ${data.hoc_ky} - ${data.nam_hoc || 'N/A'}`);
      console.log('-'.repeat(100));
      
      // Phân loại đăng ký
      const classRegs = data.registrations.filter(r => r.isClassActivity);
      const nonClassRegs = data.registrations.filter(r => !r.isClassActivity);
      
      console.log(`\n   📝 ĐĂNG KÝ:`);
      console.log(`      - Tổng số: ${data.registrations.length}`);
      console.log(`      - Thuộc lớp (Class Activity): ${classRegs.length}`);
      console.log(`      - Không thuộc lớp (Non-Class): ${nonClassRegs.length}`);
      
      if (nonClassRegs.length > 0) {
        console.log(`\n      ⚠️  ĐĂNG KÝ KHÔNG THUỘC LỚP:`);
        nonClassRegs.forEach(reg => {
          console.log(`         - ${reg.ten_hd} (${reg.trang_thai_dk}) - Người tạo: ${reg.nguoi_tao}`);
        });
      }
      
      // Phân loại điểm danh
      const classAtts = data.attendances.filter(a => a.isClassActivity);
      const nonClassAtts = data.attendances.filter(a => !a.isClassActivity);
      
      console.log(`\n   ✅ ĐIỂM DANH:`);
      console.log(`      - Tổng số: ${data.attendances.length}`);
      console.log(`      - Thuộc lớp (Class Activity): ${classAtts.length}`);
      console.log(`      - Không thuộc lớp (Non-Class): ${nonClassAtts.length}`);
      
      if (nonClassAtts.length > 0) {
        console.log(`\n      ⚠️  ĐIỂM DANH KHÔNG THUỘC LỚP:`);
        nonClassAtts.forEach(att => {
          console.log(`         - ${att.ten_hd} - Điểm: ${att.diem_rl}`);
        });
      }
      
      // Tính điểm (chỉ tính class activities có cả đăng ký và điểm danh)
      const classRegIds = new Set(classRegs.map(r => r.hd_id));
      const classAttIds = new Set(classAtts.map(a => a.hd_id));
      const validActivityIds = new Set();
      
      classRegIds.forEach(hdId => {
        if (classAttIds.has(hdId)) {
          validActivityIds.add(hdId);
        }
      });
      
      let totalPoints = 0;
      const pointsByType = {};
      
      classAtts.forEach(att => {
        if (validActivityIds.has(att.hd_id)) {
          const points = att.diem_rl;
          const type = att.loai_hd || 'Khác';
          
          if (!pointsByType[type]) {
            pointsByType[type] = { count: 0, total: 0 };
          }
          pointsByType[type].count++;
          pointsByType[type].total += points;
          totalPoints += points;
        }
      });
      
      console.log(`\n   💰 TÍNH ĐIỂM (chỉ class activities):`);
      console.log(`      - Số hoạt động hợp lệ: ${validActivityIds.size}`);
      console.log(`      - Tổng điểm: ${totalPoints.toFixed(2)}`);
      
      if (Object.keys(pointsByType).length > 0) {
        console.log(`      - Điểm theo loại:`);
        Object.entries(pointsByType).forEach(([type, data]) => {
          console.log(`         + ${type}: ${data.count} hoạt động, ${data.total.toFixed(2)} điểm`);
        });
      }
      
      // Đăng ký chưa có điểm danh
      const regsWithoutAtt = classRegs.filter(r => !classAttIds.has(r.hd_id));
      if (regsWithoutAtt.length > 0) {
        console.log(`\n   📋 ĐĂNG KÝ CHƯA CÓ ĐIỂM DANH (${regsWithoutAtt.length}):`);
        regsWithoutAtt.forEach(reg => {
          console.log(`      - ${reg.ten_hd} (${reg.trang_thai_dk}) - Điểm: ${reg.diem_rl}`);
        });
      }
    }
    
    // 6. Tập trung vào HK1 2025-2026
    console.log('\n' + '='.repeat(100));
    console.log('🎯 KIỂM TRA CHI TIẾT HK1 2025-2026:');
    console.log('='.repeat(100));
    
    const hk1_2025_2026 = bySemester['hoc_ky_1_2025-2026'];
    
    if (hk1_2025_2026) {
      const classRegs = hk1_2025_2026.registrations.filter(r => r.isClassActivity);
      const classAtts = hk1_2025_2026.attendances.filter(a => a.isClassActivity);
      
      // Tính điểm
      const classRegIds = new Set(classRegs.map(r => r.hd_id));
      const classAttIds = new Set(classAtts.map(a => a.hd_id));
      const validActivityIds = new Set();
      
      classRegIds.forEach(hdId => {
        if (classAttIds.has(hdId)) {
          validActivityIds.add(hdId);
        }
      });
      
      let totalPoints = 0;
      classAtts.forEach(att => {
        if (validActivityIds.has(att.hd_id)) {
          totalPoints += att.diem_rl;
        }
      });
      
      console.log('\n   ✅ ĐĂNG KÝ THUỘC LỚP:', classRegs.length);
      classRegs.forEach((reg, idx) => {
        const hasAttendance = classAttIds.has(reg.hd_id);
        const status = hasAttendance ? '✅ Đã điểm danh' : '⏳ Chưa điểm danh';
        console.log(`      ${idx + 1}. ${reg.ten_hd}`);
        console.log(`         - Trạng thái: ${reg.trang_thai_dk}`);
        console.log(`         - Điểm: ${reg.diem_rl}`);
        console.log(`         - Loại: ${reg.loai_hd}`);
        console.log(`         - ${status}`);
      });
      
      console.log('\n   ✅ ĐIỂM DANH THUỘC LỚP:', classAtts.length);
      classAtts.forEach((att, idx) => {
        console.log(`      ${idx + 1}. ${att.ten_hd} - Điểm: ${att.diem_rl} - Loại: ${att.loai_hd}`);
      });
      
      console.log('\n   💰 TỔNG ĐIỂM HK1 2025-2026:', totalPoints.toFixed(2));
      console.log('   📊 Số hoạt động hợp lệ:', validActivityIds.size);
      
      // So sánh với dashboard
      console.log('\n   📊 SO SÁNH VỚI DASHBOARD:');
      console.log(`      - Dashboard hiển thị: 51 điểm`);
      console.log(`      - Script tính được: ${totalPoints.toFixed(2)} điểm`);
      if (Math.abs(totalPoints - 51) < 0.1) {
        console.log(`      ✅ KHỚP!`);
      } else {
        console.log(`      ⚠️  CHÊNH LỆCH: ${Math.abs(totalPoints - 51).toFixed(2)} điểm`);
      }
      
      console.log(`      - Dashboard hiển thị: 8 hoạt động tham gia`);
      console.log(`      - Script tính được: ${validActivityIds.size} hoạt động`);
      if (validActivityIds.size === 8) {
        console.log(`      ✅ KHỚP!`);
      } else {
        console.log(`      ⚠️  CHÊNH LỆCH: ${Math.abs(validActivityIds.size - 8)} hoạt động`);
      }
      
    } else {
      console.log('\n   ❌ Không tìm thấy dữ liệu HK1 2025-2026');
    }
    
    // 7. Kiểm tra các học kỳ khác có bị lẫn vào không
    console.log('\n' + '='.repeat(100));
    console.log('🔍 KIỂM TRA CÁC HỌC KỲ KHÁC:');
    console.log('='.repeat(100));
    
    const otherSemesters = semesterKeys.filter(k => k !== 'hoc_ky_1_2025-2026');
    
    if (otherSemesters.length > 0) {
      console.log('\n   ⚠️  CÓ DỮ LIỆU CÁC HỌC KỲ KHÁC:');
      otherSemesters.forEach(semKey => {
        const data = bySemester[semKey];
        const classRegs = data.registrations.filter(r => r.isClassActivity);
        const nonClassRegs = data.registrations.filter(r => !r.isClassActivity);
        const classAtts = data.attendances.filter(a => a.isClassActivity);
        
        console.log(`\n      📅 ${data.hoc_ky} ${data.nam_hoc}:`);
        console.log(`         - Đăng ký thuộc lớp: ${classRegs.length}`);
        console.log(`         - Đăng ký không thuộc lớp: ${nonClassRegs.length}`);
        console.log(`         - Điểm danh thuộc lớp: ${classAtts.length}`);
        
        if (nonClassRegs.length > 0) {
          console.log(`         ⚠️  Có ${nonClassRegs.length} đăng ký không thuộc lớp (sẽ KHÔNG được hiển thị)`);
        }
      });
      
      console.log('\n   💡 LƯU Ý:');
      console.log('      - Các đăng ký không thuộc lớp sẽ KHÔNG được hiển thị trong dashboard');
      console.log('      - Chỉ các hoạt động từ class creators mới được tính điểm');
    } else {
      console.log('\n   ✅ Không có dữ liệu học kỳ khác');
    }
    
    console.log('\n' + '='.repeat(100));
    console.log('✅ KIỂM TRA HOÀN TẤT');
    console.log('='.repeat(100));
    
  } catch (error) {
    console.error('❌ Error:', error);
    console.error(error.stack);
  } finally {
    await prisma.$disconnect();
  }
}

checkSemesterData();

