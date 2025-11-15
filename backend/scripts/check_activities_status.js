/**
 * Script kiểm tra trạng thái hoạt động để tìm 2 hoạt động bị thiếu
 * Usage: node scripts/check_activities_status.js
 */

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkActivitiesStatus() {
  const mssv = '202101002';
  
  try {
    console.log('='.repeat(100));
    console.log('🔍 KIỂM TRA TRẠNG THÁI HOẠT ĐỘNG - TÌM 2 HOẠT ĐỘNG BỊ THIẾU');
    console.log('='.repeat(100));
    
    // 1. Tìm sinh viên
    const sinhVien = await prisma.sinhVien.findUnique({
      where: { mssv },
      include: {
        lop: {
          select: {
            id: true,
            chu_nhiem: true
          }
        }
      }
    });
    
    if (!sinhVien) {
      console.error('❌ Không tìm thấy sinh viên');
      return;
    }
    
    // 2. Lấy class creators
    const classStudents = await prisma.sinhVien.findMany({
      where: { lop_id: sinhVien.lop_id },
      select: { nguoi_dung_id: true }
    });
    const classCreatorUserIds = classStudents.map(s => s.nguoi_dung_id).filter(Boolean);
    if (sinhVien.lop?.chu_nhiem) {
      classCreatorUserIds.push(sinhVien.lop.chu_nhiem);
    }
    
    // 3. Lấy hoạt động thuộc lớp HK1 2025-2026
    const classActivities = await prisma.hoatDong.findMany({
      where: {
        hoc_ky: 'hoc_ky_1',
        nam_hoc: '2025-2026',
        nguoi_tao_id: { in: classCreatorUserIds }
      },
      include: {
        loai_hd: {
          select: {
            ten_loai_hd: true
          }
        }
      },
      orderBy: {
        ngay_tao: 'desc'
      }
    });
    
    console.log('\n📊 TỔNG SỐ HOẠT ĐỘNG THUỘC LỚP:', classActivities.length);
    
    // 4. Phân loại theo trạng thái
    const byStatus = {
      cho_duyet: [],
      da_duyet: [],
      tu_choi: []
    };
    
    classActivities.forEach(act => {
      const status = act.trang_thai;
      if (byStatus[status]) {
        byStatus[status].push(act);
      } else {
        if (!byStatus.other) byStatus.other = [];
        byStatus.other.push(act);
      }
    });
    
    console.log('\n📋 PHÂN LOẠI THEO TRẠNG THÁI:');
    Object.entries(byStatus).forEach(([status, acts]) => {
      if (acts.length > 0) {
        console.log(`\n   ${status.toUpperCase()}: ${acts.length} hoạt động`);
        acts.forEach((act, idx) => {
          console.log(`      ${idx + 1}. ${act.ten_hd} - ${act.loai_hd?.ten_loai_hd || 'N/A'}`);
        });
      }
    });
    
    // 5. Kiểm tra xem có filter theo trạng thái không
    console.log('\n' + '='.repeat(100));
    console.log('🔍 PHÂN TÍCH:');
    console.log('='.repeat(100));
    
    console.log('\n   - Tổng hoạt động: 22');
    console.log('   - Dashboard hiển thị: 20');
    console.log('   - Chênh lệch: 2 hoạt động');
    
    // Có thể 2 hoạt động "cho_duyet" bị ẩn
    if (byStatus.cho_duyet && byStatus.cho_duyet.length > 0) {
      console.log(`\n   💡 CÓ THỂ: ${byStatus.cho_duyet.length} hoạt động "cho_duyet" bị ẩn`);
      console.log('      - Frontend có thể filter chỉ hiển thị "da_duyet"');
      console.log('      - Hoặc có logic ẩn hoạt động chưa được duyệt');
    }
    
    // 6. Kiểm tra đăng ký của sinh viên
    const registrations = await prisma.dangKyHoatDong.findMany({
      where: {
        sv_id: sinhVien.id,
        hoat_dong: {
          hoc_ky: 'hoc_ky_1',
          nam_hoc: '2025-2026',
          nguoi_tao_id: { in: classCreatorUserIds }
        }
      },
      include: {
        hoat_dong: {
          select: {
            id: true,
            ten_hd: true,
            trang_thai: true
          }
        }
      }
    });
    
    const regHdIds = new Set(registrations.map(r => r.hoat_dong.id));
    
    console.log('\n📝 ĐĂNG KÝ CỦA SINH VIÊN:');
    console.log(`   - Tổng số: ${registrations.length}`);
    console.log(`   - Hoạt động đã đăng ký: ${regHdIds.size}`);
    
    // Hoạt động chưa đăng ký
    const notRegistered = classActivities.filter(act => !regHdIds.has(act.id));
    console.log(`   - Hoạt động chưa đăng ký: ${notRegistered.length}`);
    
    if (notRegistered.length === 2) {
      console.log('\n   💡 CÓ THỂ: 2 hoạt động chưa đăng ký bị ẩn');
      console.log('      - Frontend có thể chỉ hiển thị hoạt động đã đăng ký');
      notRegistered.forEach(act => {
        console.log(`      - ${act.ten_hd} (${act.trang_thai})`);
      });
    }
    
    // 7. Tóm tắt
    console.log('\n' + '='.repeat(100));
    console.log('📊 TÓM TẮT:');
    console.log('='.repeat(100));
    console.log(`   - Tổng hoạt động thuộc lớp: ${classActivities.length}`);
    console.log(`   - Hoạt động "cho_duyet": ${byStatus.cho_duyet?.length || 0}`);
    console.log(`   - Hoạt động "da_duyet": ${byStatus.da_duyet?.length || 0}`);
    console.log(`   - Hoạt động chưa đăng ký: ${notRegistered.length}`);
    console.log(`   - Dashboard hiển thị: 20`);
    
    console.log('\n   💡 NGUYÊN NHÂN CÓ THỂ:');
    if (byStatus.cho_duyet && byStatus.cho_duyet.length === 2) {
      console.log('      ✅ 2 hoạt động "cho_duyet" bị filter (không hiển thị)');
    } else if (notRegistered.length === 2) {
      console.log('      ✅ 2 hoạt động chưa đăng ký bị filter (không hiển thị)');
    } else {
      console.log('      ⚠️  Cần kiểm tra thêm logic filter ở frontend');
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

checkActivitiesStatus();

