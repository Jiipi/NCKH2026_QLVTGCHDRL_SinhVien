/**
 * Script kiểm tra dữ liệu lớp trưởng 202101001
 * Kiểm tra xem dữ liệu có đúng với Prisma Studio không
 * Usage: node scripts/check_monitor_data.js
 */

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkMonitorData() {
  const mssv = '202101001';
  
  try {
    console.log('='.repeat(100));
    console.log('🔍 KIỂM TRA DỮ LIỆU LỚP TRƯỞNG:', mssv);
    console.log('='.repeat(100));
    
    // 1. Tìm lớp trưởng
    const sinhVien = await prisma.sinhVien.findUnique({
      where: { mssv },
      include: {
        nguoi_dung: {
          select: {
            id: true,
            ho_ten: true,
            email: true,
            ten_dn: true
          }
        },
        lop: {
          select: {
            id: true,
            ten_lop: true,
            khoa: true,
            chu_nhiem: true
          }
        }
      }
    });
    
    if (!sinhVien) {
      console.error('❌ Không tìm thấy lớp trưởng');
      return;
    }
    
    console.log('\n📋 THÔNG TIN LỚP TRƯỞNG:');
    console.log('   - MSSV:', sinhVien.mssv);
    console.log('   - Họ tên:', sinhVien.nguoi_dung.ho_ten);
    console.log('   - Email:', sinhVien.nguoi_dung.email);
    console.log('   - User ID:', sinhVien.nguoi_dung_id);
    console.log('   - Lớp ID:', sinhVien.lop_id);
    console.log('   - Tên lớp:', sinhVien.lop?.ten_lop);
    console.log('   - Khoa:', sinhVien.lop?.khoa);
    console.log('   - GVCN ID:', sinhVien.lop?.chu_nhiem);
    
    // 2. Kiểm tra vai trò
    const vaiTro = await prisma.nguoiDung.findUnique({
      where: { id: sinhVien.nguoi_dung_id },
      include: {
        vai_tro: {
          select: {
            ten_vt: true
          }
        }
      }
    });
    
    console.log('\n👤 VAI TRÒ:');
    console.log('   - Vai trò:', vaiTro?.vai_tro?.ten_vt || 'N/A');
    
    // 3. Lấy số sinh viên trong lớp
    const classStudents = await prisma.sinhVien.findMany({
      where: { lop_id: sinhVien.lop_id },
      select: {
        id: true,
        mssv: true,
        nguoi_dung_id: true
      }
    });
    
    console.log('\n👥 SINH VIÊN TRONG LỚP:', classStudents.length);
    
    // 4. Lấy class creators (sinh viên + GVCN)
    const classCreatorUserIds = classStudents.map(s => s.nguoi_dung_id).filter(Boolean);
    if (sinhVien.lop?.chu_nhiem) {
      classCreatorUserIds.push(sinhVien.lop.chu_nhiem);
    }
    
    console.log('   - Class creators:', classCreatorUserIds.length);
    
    // 5. Kiểm tra đăng ký chờ duyệt
    const pendingRegistrations = await prisma.dangKyHoatDong.findMany({
      where: {
        trang_thai_dk: 'cho_duyet',
        sinh_vien: {
          lop_id: sinhVien.lop_id
        }
      },
      include: {
        hoat_dong: {
          select: {
            id: true,
            ten_hd: true,
            hoc_ky: true,
            nam_hoc: true,
            nguoi_tao_id: true
          }
        },
        sinh_vien: {
          select: {
            mssv: true,
            nguoi_dung: {
              select: {
                ho_ten: true
              }
            }
          }
        }
      }
    });
    
    console.log('\n📝 ĐĂNG KÝ CHỜ DUYỆT:', pendingRegistrations.length);
    pendingRegistrations.forEach((reg, idx) => {
      console.log(`   ${idx + 1}. ${reg.hoat_dong.ten_hd} - ${reg.sinh_vien.mssv} (${reg.sinh_vien.nguoi_dung.ho_ten})`);
      console.log(`      - Học kỳ: ${reg.hoat_dong.hoc_ky} ${reg.hoat_dong.nam_hoc}`);
      const isClassActivity = classCreatorUserIds.includes(reg.hoat_dong.nguoi_tao_id);
      console.log(`      - Class Activity: ${isClassActivity ? '✅' : '❌'}`);
    });
    
    // 6. Kiểm tra hoạt động theo học kỳ
    console.log('\n' + '='.repeat(100));
    console.log('📊 KIỂM TRA THEO HỌC KỲ:');
    console.log('='.repeat(100));
    
    // HK1 2025-2026
    const hk1_2025_2026 = {
      hoc_ky: 'hoc_ky_1',
      nam_hoc: '2025-2026'
    };
    
    const activities_hk1 = await prisma.hoatDong.findMany({
      where: {
        hoc_ky: hk1_2025_2026.hoc_ky,
        nam_hoc: hk1_2025_2026.nam_hoc,
        nguoi_tao_id: { in: classCreatorUserIds }
      },
      select: {
        id: true,
        ten_hd: true,
        trang_thai: true,
        diem_rl: true
      }
    });
    
    console.log(`\n📅 HK1 2025-2026:`);
    console.log(`   - Hoạt động thuộc lớp: ${activities_hk1.length}`);
    
    // Đăng ký của lớp trưởng
    const monitorRegs_hk1 = await prisma.dangKyHoatDong.findMany({
      where: {
        sv_id: sinhVien.id,
        hoat_dong: {
          hoc_ky: hk1_2025_2026.hoc_ky,
          nam_hoc: hk1_2025_2026.nam_hoc,
          nguoi_tao_id: { in: classCreatorUserIds }
        }
      },
      include: {
        hoat_dong: {
          select: {
            id: true,
            ten_hd: true,
            diem_rl: true
          }
        }
      }
    });
    
    console.log(`   - Đăng ký của lớp trưởng: ${monitorRegs_hk1.length}`);
    
    // Điểm danh của lớp trưởng
    const monitorAtts_hk1 = await prisma.diemDanh.findMany({
      where: {
        sv_id: sinhVien.id,
        xac_nhan_tham_gia: true,
        hoat_dong: {
          hoc_ky: hk1_2025_2026.hoc_ky,
          nam_hoc: hk1_2025_2026.nam_hoc,
          nguoi_tao_id: { in: classCreatorUserIds }
        }
      },
      include: {
        hoat_dong: {
          select: {
            id: true,
            ten_hd: true,
            diem_rl: true
          }
        }
      }
    });
    
    console.log(`   - Điểm danh của lớp trưởng: ${monitorAtts_hk1.length}`);
    
    // Tính điểm
    const regIds = new Set(monitorRegs_hk1.map(r => r.hoat_dong.id));
    const attIds = new Set(monitorAtts_hk1.map(a => a.hoat_dong.id));
    const validIds = new Set();
    regIds.forEach(id => {
      if (attIds.has(id)) {
        validIds.add(id);
      }
    });
    
    let totalPoints = 0;
    monitorAtts_hk1.forEach(att => {
      if (validIds.has(att.hoat_dong.id)) {
        totalPoints += parseFloat(att.hoat_dong.diem_rl || 0);
      }
    });
    
    console.log(`   - Điểm tính được: ${totalPoints.toFixed(2)}`);
    
    // HK2 2025-2026 (học kỳ hiện tại trên dashboard)
    const hk2_2025_2026 = {
      hoc_ky: 'hoc_ky_2',
      nam_hoc: '2025-2026'
    };
    
    const activities_hk2 = await prisma.hoatDong.findMany({
      where: {
        hoc_ky: hk2_2025_2026.hoc_ky,
        nam_hoc: hk2_2025_2026.nam_hoc,
        nguoi_tao_id: { in: classCreatorUserIds }
      },
      select: {
        id: true,
        ten_hd: true,
        trang_thai: true
      }
    });
    
    console.log(`\n📅 HK2 2025-2026 (học kỳ trên dashboard):`);
    console.log(`   - Hoạt động thuộc lớp: ${activities_hk2.length}`);
    
    const monitorRegs_hk2 = await prisma.dangKyHoatDong.findMany({
      where: {
        sv_id: sinhVien.id,
        hoat_dong: {
          hoc_ky: hk2_2025_2026.hoc_ky,
          nam_hoc: hk2_2025_2026.nam_hoc,
          nguoi_tao_id: { in: classCreatorUserIds }
        }
      }
    });
    
    console.log(`   - Đăng ký của lớp trưởng: ${monitorRegs_hk2.length}`);
    
    const monitorAtts_hk2 = await prisma.diemDanh.findMany({
      where: {
        sv_id: sinhVien.id,
        xac_nhan_tham_gia: true,
        hoat_dong: {
          hoc_ky: hk2_2025_2026.hoc_ky,
          nam_hoc: hk2_2025_2026.nam_hoc,
          nguoi_tao_id: { in: classCreatorUserIds }
        }
      }
    });
    
    console.log(`   - Điểm danh của lớp trưởng: ${monitorAtts_hk2.length}`);
    
    // 7. Tóm tắt
    console.log('\n' + '='.repeat(100));
    console.log('📊 TÓM TẮT:');
    console.log('='.repeat(100));
    console.log(`   - Tổng sinh viên trong lớp: ${classStudents.length}`);
    console.log(`   - Đăng ký chờ duyệt: ${pendingRegistrations.length}`);
    console.log(`   - HK1 2025-2026:`);
    console.log(`      + Hoạt động: ${activities_hk1.length}`);
    console.log(`      + Đăng ký: ${monitorRegs_hk1.length}`);
    console.log(`      + Điểm danh: ${monitorAtts_hk1.length}`);
    console.log(`      + Điểm: ${totalPoints.toFixed(2)}`);
    console.log(`   - HK2 2025-2026:`);
    console.log(`      + Hoạt động: ${activities_hk2.length}`);
    console.log(`      + Đăng ký: ${monitorRegs_hk2.length}`);
    console.log(`      + Điểm danh: ${monitorAtts_hk2.length}`);
    
    console.log('\n   💡 DASHBOARD HIỂN THỊ:');
    console.log('      - Điểm cá nhân: 0/100');
    console.log('      - Tham gia: 0 hoạt động');
    console.log('      - Chờ duyệt: 0');
    console.log('      - Lớp học: 1 sinh viên');
    console.log('      - Đã duyệt: 0 hoạt động lớp');
    console.log('      - Sắp tới: 0 hoạt động');
    console.log('      - Hạng: 1/1');
    
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

checkMonitorData();

