/**
 * Script debug tính điểm để tìm chênh lệch 4 điểm
 * Usage: node scripts/debug_points_calculation.js
 */

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function debugPointsCalculation() {
  const mssv = '202101002';
  
  try {
    console.log('='.repeat(100));
    console.log('🔍 DEBUG TÍNH ĐIỂM - TÌM CHÊNH LỆCH 4 ĐIỂM');
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
    
    // 3. Filter cho HK1 2025-2026
    const activityWhereClause = {
      hoc_ky: 'hoc_ky_1',
      nam_hoc: '2025-2026',
      nguoi_tao_id: { in: classCreatorUserIds }
    };
    
    console.log('\n📋 Activity where clause:', JSON.stringify(activityWhereClause, null, 2));
    
    // 4. Lấy đăng ký
    const registrations = await prisma.dangKyHoatDong.findMany({
      where: {
        sv_id: sinhVien.id,
        hoat_dong: activityWhereClause
      },
      include: {
        hoat_dong: {
          select: {
            id: true,
            ten_hd: true,
            diem_rl: true,
            loai_hd: {
              select: {
                ten_loai_hd: true
              }
            }
          }
        }
      }
    });
    
    console.log('\n📝 ĐĂNG KÝ:', registrations.length);
    registrations.forEach((reg, idx) => {
      console.log(`   ${idx + 1}. ${reg.hoat_dong.ten_hd} - Điểm: ${reg.hoat_dong.diem_rl} - Trạng thái: ${reg.trang_thai_dk}`);
    });
    
    // 5. Lấy điểm danh
    const attendances = await prisma.diemDanh.findMany({
      where: {
        sv_id: sinhVien.id,
        xac_nhan_tham_gia: true,
        hoat_dong: activityWhereClause
      },
      include: {
        hoat_dong: {
          select: {
            id: true,
            ten_hd: true,
            diem_rl: true,
            loai_hd: {
              select: {
                ten_loai_hd: true
              }
            }
          }
        }
      }
    });
    
    console.log('\n✅ ĐIỂM DANH:', attendances.length);
    attendances.forEach((att, idx) => {
      console.log(`   ${idx + 1}. ${att.hoat_dong.ten_hd} - Điểm: ${att.hoat_dong.diem_rl}`);
    });
    
    // 6. Logic tính điểm (giống dashboard service)
    const hdIdsWithQR = new Set(attendances.map(a => a.hoat_dong.id));
    const validRegistrations = registrations.filter(r => hdIdsWithQR.has(r.hoat_dong.id));
    
    console.log('\n🔍 PHÂN TÍCH:');
    console.log('   - Đăng ký có điểm danh (valid):', validRegistrations.length);
    console.log('   - Đăng ký chưa có điểm danh:', registrations.length - validRegistrations.length);
    
    // 7. Tính điểm từ valid registrations
    let totalPoints = 0;
    const pointsByActivity = [];
    
    validRegistrations.forEach(reg => {
      const points = parseFloat(reg.hoat_dong.diem_rl || 0);
      totalPoints += points;
      pointsByActivity.push({
        ten_hd: reg.hoat_dong.ten_hd,
        diem_rl: points,
        loai_hd: reg.hoat_dong.loai_hd?.ten_loai_hd
      });
    });
    
    console.log('\n💰 TÍNH ĐIỂM (theo logic dashboard service):');
    console.log('   - Tổng điểm:', totalPoints.toFixed(2));
    console.log('   - Chi tiết:');
    pointsByActivity.forEach((act, idx) => {
      console.log(`      ${idx + 1}. ${act.ten_hd} - ${act.diem_rl} điểm (${act.loai_hd})`);
    });
    
    // 8. So sánh với script trước
    console.log('\n📊 SO SÁNH:');
    console.log('   - Script check_semester_data.js: 55.00 điểm');
    console.log('   - Script này (theo logic dashboard):', totalPoints.toFixed(2), 'điểm');
    console.log('   - Dashboard hiển thị: 51 điểm');
    
    const diff1 = Math.abs(totalPoints - 55);
    const diff2 = Math.abs(totalPoints - 51);
    
    console.log(`\n   - Chênh lệch với script trước: ${diff1.toFixed(2)} điểm`);
    console.log(`   - Chênh lệch với dashboard: ${diff2.toFixed(2)} điểm`);
    
    // 9. Kiểm tra từng hoạt động
    console.log('\n🔍 KIỂM TRA TỪNG HOẠT ĐỘNG:');
    
    const allHdIds = new Set([
      ...registrations.map(r => r.hoat_dong.id),
      ...attendances.map(a => a.hoat_dong.id)
    ]);
    
    for (const hdId of allHdIds) {
      const reg = registrations.find(r => r.hoat_dong.id === hdId);
      const att = attendances.find(a => a.hoat_dong.id === hdId);
      
      const hasReg = !!reg;
      const hasAtt = !!att;
      const isValid = hasReg && hasAtt;
      
      console.log(`\n   📋 ${reg?.hoat_dong.ten_hd || att?.hoat_dong.ten_hd}:`);
      console.log(`      - Có đăng ký: ${hasReg ? '✅' : '❌'}`);
      console.log(`      - Có điểm danh: ${hasAtt ? '✅' : '❌'}`);
      console.log(`      - Hợp lệ (có cả 2): ${isValid ? '✅' : '❌'}`);
      
      if (hasReg) {
        console.log(`      - Điểm (từ đăng ký): ${reg.hoat_dong.diem_rl}`);
      }
      if (hasAtt) {
        console.log(`      - Điểm (từ điểm danh): ${att.hoat_dong.diem_rl}`);
      }
      
      if (hasReg && hasAtt && reg.hoat_dong.diem_rl !== att.hoat_dong.diem_rl) {
        console.log(`      ⚠️  CẢNH BÁO: Điểm không khớp giữa đăng ký và điểm danh!`);
      }
      
      if (isValid) {
        console.log(`      - ✅ Được tính điểm: ${reg.hoat_dong.diem_rl}`);
      } else if (hasAtt && !hasReg) {
        console.log(`      - ⚠️  Có điểm danh nhưng KHÔNG có đăng ký - KHÔNG được tính điểm`);
      } else if (hasReg && !hasAtt) {
        console.log(`      - ⏳ Có đăng ký nhưng chưa điểm danh - KHÔNG được tính điểm`);
      }
    }
    
    console.log('\n' + '='.repeat(100));
    console.log('✅ DEBUG HOÀN TẤT');
    console.log('='.repeat(100));
    
  } catch (error) {
    console.error('❌ Error:', error);
    console.error(error.stack);
  } finally {
    await prisma.$disconnect();
  }
}

debugPointsCalculation();

