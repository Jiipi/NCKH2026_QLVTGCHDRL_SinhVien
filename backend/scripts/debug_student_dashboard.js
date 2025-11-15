/**
 * Debug script to check student dashboard data
 * Usage: node scripts/debug_student_dashboard.js
 */

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function debugStudentDashboard() {
  const mssv = '202101002';
  
  try {
    console.log('🔍 Debugging student dashboard for MSSV:', mssv);
    console.log('='.repeat(80));
    
    // 1. Find student
    const sinhVien = await prisma.sinhVien.findUnique({
      where: { mssv },
      include: {
        nguoi_dung: {
          select: {
            id: true,
            ho_ten: true,
            email: true
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
      console.error('❌ Không tìm thấy sinh viên với MSSV:', mssv);
      return;
    }
    
    console.log('\n📋 Thông tin sinh viên:');
    console.log('  - ID:', sinhVien.id);
    console.log('  - MSSV:', sinhVien.mssv);
    console.log('  - Họ tên:', sinhVien.nguoi_dung.ho_ten);
    console.log('  - Email:', sinhVien.nguoi_dung.email);
    console.log('  - User ID:', sinhVien.nguoi_dung_id);
    console.log('  - Lớp ID:', sinhVien.lop_id);
    console.log('  - Tên lớp:', sinhVien.lop?.ten_lop);
    console.log('  - Khoa:', sinhVien.lop?.khoa);
    console.log('  - Chủ nhiệm ID:', sinhVien.lop?.chu_nhiem);
    
    // 2. Get class creators
    const lopId = sinhVien.lop_id;
    const chuNhiemId = sinhVien.lop?.chu_nhiem;
    
    const classStudents = await prisma.sinhVien.findMany({
      where: { lop_id: lopId },
      select: {
        id: true,
        mssv: true,
        nguoi_dung_id: true
      }
    });
    
    const classCreators = classStudents.map(s => s.nguoi_dung_id).filter(Boolean);
    if (chuNhiemId) {
      classCreators.push(chuNhiemId);
    }
    
    console.log('\n👥 Class creators (students + homeroom teacher):');
    console.log('  - Total:', classCreators.length);
    console.log('  - IDs:', classCreators);
    
    // 3. Get all activities (without filter)
    const allActivities = await prisma.hoatDong.findMany({
      select: {
        id: true,
        ten_hd: true,
        nguoi_tao_id: true,
        hoc_ky: true,
        nam_hoc: true,
        trang_thai: true
      }
    });
    
    console.log('\n📊 Tất cả hoạt động trong hệ thống:');
    console.log('  - Total:', allActivities.length);
    
    // 4. Get activities created by class creators
    const classActivities = await prisma.hoatDong.findMany({
      where: {
        nguoi_tao_id: { in: classCreators }
      },
      select: {
        id: true,
        ten_hd: true,
        nguoi_tao_id: true,
        hoc_ky: true,
        nam_hoc: true,
        trang_thai: true
      }
    });
    
    console.log('\n🎯 Hoạt động của lớp (created by class creators):');
    console.log('  - Total:', classActivities.length);
    classActivities.forEach(act => {
      console.log(`    - ${act.ten_hd} (${act.hoc_ky} ${act.nam_hoc}) - Status: ${act.trang_thai}`);
    });
    
    // 5. Get student registrations
    const registrations = await prisma.dangKyHoatDong.findMany({
      where: {
        sv_id: sinhVien.id
      },
      include: {
        hoat_dong: {
          select: {
            id: true,
            ten_hd: true,
            nguoi_tao_id: true,
            hoc_ky: true,
            nam_hoc: true,
            trang_thai: true
          }
        }
      }
    });
    
    console.log('\n📝 Đăng ký của sinh viên:');
    console.log('  - Total:', registrations.length);
    registrations.forEach(reg => {
      const act = reg.hoat_dong;
      const isClassActivity = classCreators.includes(act.nguoi_tao_id);
      console.log(`    - ${act.ten_hd} (${act.hoc_ky} ${act.nam_hoc}) - Status: ${reg.trang_thai_dk} - Class Activity: ${isClassActivity}`);
    });
    
    // 6. Get student attendances
    const attendances = await prisma.diemDanh.findMany({
      where: {
        sv_id: sinhVien.id,
        xac_nhan_tham_gia: true
      },
      include: {
        hoat_dong: {
          select: {
            id: true,
            ten_hd: true,
            nguoi_tao_id: true,
            hoc_ky: true,
            nam_hoc: true
          }
        }
      }
    });
    
    console.log('\n✅ Điểm danh của sinh viên (đã tham gia):');
    console.log('  - Total:', attendances.length);
    attendances.forEach(att => {
      const act = att.hoat_dong;
      const isClassActivity = classCreators.includes(act.nguoi_tao_id);
      console.log(`    - ${act.ten_hd} (${act.hoc_ky} ${act.nam_hoc}) - Class Activity: ${isClassActivity}`);
    });
    
    // 7. Check activities by creator type
    const activitiesByCreator = await prisma.hoatDong.groupBy({
      by: ['nguoi_tao_id'],
      _count: {
        id: true
      }
    });
    
    console.log('\n👤 Hoạt động theo người tạo:');
    console.log('  - Total unique creators:', activitiesByCreator.length);
    const classCreatorActivities = activitiesByCreator.filter(a => classCreators.includes(a.nguoi_tao_id));
    console.log('  - Activities by class creators:', classCreatorActivities.reduce((sum, a) => sum + a._count.id, 0));
    
    // 8. Check current semester
    let currentSemester = null;
    try {
      currentSemester = await prisma.hocKy.findFirst({
        where: {
          isCurrent: true
        }
      });
    } catch (err) {
      console.log('  - Error checking current semester (table might not exist):', err.message);
    }
    
    console.log('\n📅 Học kỳ hiện tại:');
    if (currentSemester) {
      console.log('  - Semester:', currentSemester.semester);
      console.log('  - Year:', currentSemester.year);
      console.log('  - Value:', `${currentSemester.semester}-${currentSemester.year}`);
    } else {
      console.log('  - Không có học kỳ hiện tại');
    }
    
    console.log('\n' + '='.repeat(80));
    console.log('✅ Debug completed');
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

debugStudentDashboard();

