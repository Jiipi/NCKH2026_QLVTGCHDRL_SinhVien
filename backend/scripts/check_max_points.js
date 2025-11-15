/**
 * Script kiểm tra điểm tối đa theo loại hoạt động
 * Usage: node scripts/check_max_points.js
 */

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkMaxPoints() {
  const mssv = '202101002';
  
  try {
    console.log('='.repeat(100));
    console.log('🔍 KIỂM TRA ĐIỂM TỐI ĐA THEO LOẠI HOẠT ĐỘNG');
    console.log('='.repeat(100));
    
    // 1. Lấy tất cả loại hoạt động
    const activityTypes = await prisma.loaiHoatDong.findMany({
      select: {
        id: true,
        ten_loai_hd: true,
        diem_toi_da: true
      }
    });
    
    console.log('\n📋 ĐIỂM TỐI ĐA THEO LOẠI:');
    activityTypes.forEach(type => {
      console.log(`   - ${type.ten_loai_hd}: ${type.diem_toi_da} điểm`);
    });
    
    // 2. Tìm sinh viên
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
    
    // 3. Lấy class creators
    const classStudents = await prisma.sinhVien.findMany({
      where: { lop_id: sinhVien.lop_id },
      select: { nguoi_dung_id: true }
    });
    const classCreatorUserIds = classStudents.map(s => s.nguoi_dung_id).filter(Boolean);
    if (sinhVien.lop?.chu_nhiem) {
      classCreatorUserIds.push(sinhVien.lop.chu_nhiem);
    }
    
    // 4. Filter cho HK1 2025-2026
    const activityWhereClause = {
      hoc_ky: 'hoc_ky_1',
      nam_hoc: '2025-2026',
      nguoi_tao_id: { in: classCreatorUserIds }
    };
    
    // 5. Lấy đăng ký và điểm danh
    const registrations = await prisma.dangKyHoatDong.findMany({
      where: {
        sv_id: sinhVien.id,
        hoat_dong: activityWhereClause
      },
      include: {
        hoat_dong: {
          include: {
            loai_hd: {
              select: {
                ten_loai_hd: true,
                diem_toi_da: true
              }
            }
          }
        }
      }
    });
    
    const attendances = await prisma.diemDanh.findMany({
      where: {
        sv_id: sinhVien.id,
        xac_nhan_tham_gia: true,
        hoat_dong: activityWhereClause
      },
      include: {
        hoat_dong: {
          include: {
            loai_hd: {
              select: {
                ten_loai_hd: true,
                diem_toi_da: true
              }
            }
          }
        }
      }
    });
    
    // 6. Logic tính điểm (giống dashboard service)
    const hdIdsWithQR = new Set(attendances.map(a => a.hoat_dong.id));
    const validRegistrations = registrations.filter(r => hdIdsWithQR.has(r.hoat_dong.id));
    
    // Tạo max points map
    const maxPointsMap = {};
    activityTypes.forEach(type => {
      maxPointsMap[type.ten_loai_hd] = Number(type.diem_toi_da || 0);
    });
    
    // Tính điểm theo loại
    const pointsByType = {};
    
    validRegistrations.forEach(reg => {
      const activity = reg.hoat_dong;
      const activityType = activity.loai_hd?.ten_loai_hd || 'Khác';
      const points = parseFloat(activity.diem_rl || 0);
      
      if (!pointsByType[activityType]) {
        pointsByType[activityType] = {
          ten_loai: activityType,
          so_hoat_dong: 0,
          tong_diem_thuc: 0,
          diem_toi_da: maxPointsMap[activityType] || 0,
          tong_diem: 0,
          activities: []
        };
      }
      
      pointsByType[activityType].so_hoat_dong++;
      pointsByType[activityType].tong_diem_thuc += points;
      pointsByType[activityType].activities.push({
        ten_hd: activity.ten_hd,
        diem_rl: points
      });
    });
    
    // Áp dụng giới hạn điểm tối đa
    let totalPoints = 0;
    let totalPointsBeforeCap = 0;
    
    console.log('\n' + '='.repeat(100));
    console.log('💰 TÍNH ĐIỂM THEO LOẠI (có giới hạn điểm tối đa):');
    console.log('='.repeat(100));
    
    Object.values(pointsByType).forEach(typeData => {
      totalPointsBeforeCap += typeData.tong_diem_thuc;
      const cappedPoints = Math.min(typeData.tong_diem_thuc, typeData.diem_toi_da);
      typeData.tong_diem = cappedPoints;
      totalPoints += cappedPoints;
      
      const isCapped = typeData.tong_diem_thuc > typeData.diem_toi_da;
      const diff = typeData.tong_diem_thuc - cappedPoints;
      
      console.log(`\n   📊 ${typeData.ten_loai}:`);
      console.log(`      - Số hoạt động: ${typeData.so_hoat_dong}`);
      console.log(`      - Tổng điểm thực tế: ${typeData.tong_diem_thuc.toFixed(2)}`);
      console.log(`      - Điểm tối đa cho phép: ${typeData.diem_toi_da}`);
      console.log(`      - Điểm sau khi giới hạn: ${cappedPoints.toFixed(2)}`);
      
      if (isCapped) {
        console.log(`      ⚠️  BỊ GIỚI HẠN: -${diff.toFixed(2)} điểm`);
      }
      
      console.log(`      - Chi tiết hoạt động:`);
      typeData.activities.forEach(act => {
        console.log(`         + ${act.ten_hd}: ${act.diem_rl} điểm`);
      });
    });
    
    console.log('\n' + '='.repeat(100));
    console.log('📊 TỔNG KẾT:');
    console.log('='.repeat(100));
    console.log(`   - Tổng điểm trước khi giới hạn: ${totalPointsBeforeCap.toFixed(2)}`);
    console.log(`   - Tổng điểm sau khi giới hạn: ${totalPoints.toFixed(2)}`);
    console.log(`   - Điểm bị cắt bớt: ${(totalPointsBeforeCap - totalPoints).toFixed(2)}`);
    console.log(`   - Dashboard hiển thị: 51 điểm`);
    console.log(`   - Script tính được: ${totalPoints.toFixed(2)} điểm`);
    
    const diff = Math.abs(totalPoints - 51);
    if (diff < 0.1) {
      console.log(`   ✅ KHỚP! (chênh lệch < 0.1)`);
    } else {
      console.log(`   ⚠️  CHÊNH LỆCH: ${diff.toFixed(2)} điểm`);
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

checkMaxPoints();

