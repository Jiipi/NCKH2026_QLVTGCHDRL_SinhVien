/**
 * Script tạo dữ liệu mẫu cho Admin Dashboard
 * Tạo: Học kỳ, Hoạt động, Đăng ký (đa trạng thái)
 * 
 * Usage: node backend/scripts/seed_admin_dashboard_data.js
 */

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function seedAdminDashboardData() {
  console.log('='.repeat(80));
  console.log('🌱 TẠO DỮ LIỆU MẪU CHO ADMIN DASHBOARD');
  console.log('='.repeat(80));
  console.log();

  try {
    // 1. KIỂM TRA DỮ LIỆU HIỆN TẠI
    console.log('1️⃣  Kiểm tra dữ liệu hiện tại...');
    
    const [existingActivities, existingRegistrations, existingSemesters] = await Promise.all([
      prisma.hoatDong.count(),
      prisma.dangKyHoatDong.count(),
      prisma.hoatDong.findMany({
        select: { hoc_ky: true, nam_hoc: true },
        distinct: ['hoc_ky', 'nam_hoc'],
        where: { nam_hoc: { not: null } }
      })
    ]);

    console.log(`   - Hoạt động hiện có: ${existingActivities}`);
    console.log(`   - Đăng ký hiện có: ${existingRegistrations}`);
    console.log(`   - Học kỳ hiện có: ${existingSemesters.length}`);
    console.log();

    // 2. LẤY SINH VIÊN VÀ LỚP
    console.log('2️⃣  Lấy danh sách sinh viên...');
    
    const students = await prisma.sinhVien.findMany({
      include: {
        nguoi_dung: { select: { ho_ten: true, ten_dn: true } },
        lop: { select: { ten_lop: true } }
      },
      take: 20
    });

    if (students.length === 0) {
      console.log('❌ KHÔNG TÌM THẤY SINH VIÊN! Cần tạo sinh viên trước.');
      console.log('💡 Chạy: node backend/scripts/create_sample_students.js');
      return;
    }

    console.log(`   ✅ Tìm thấy ${students.length} sinh viên`);
    console.log();

    // 3. TẠO HOẠT ĐỘNG MẪU (nếu chưa đủ)
    console.log('3️⃣  Tạo hoạt động mẫu...');
    
    const currentYear = new Date().getFullYear();
    const semesters = [
      { hoc_ky: 'hoc_ky_1', nam_hoc: `${currentYear}-${currentYear + 1}`, label: `HK1 ${currentYear}-${currentYear + 1}` },
      { hoc_ky: 'hoc_ky_2', nam_hoc: `${currentYear}-${currentYear + 1}`, label: `HK2 ${currentYear}-${currentYear + 1}` },
      { hoc_ky: 'hoc_ky_1', nam_hoc: `${currentYear - 1}-${currentYear}`, label: `HK1 ${currentYear - 1}-${currentYear}` }
    ];

    const activityTypes = [
      { ten_hd: 'Hội thảo Kỹ năng mềm', diem_ren_luyen: 5, loai: 'hoi_thao' },
      { ten_hd: 'Tình nguyện Mùa hè xanh', diem_ren_luyen: 10, loai: 'tinh_nguyen' },
      { ten_hd: 'Cuộc thi Lập trình', diem_ren_luyen: 8, loai: 'cuoc_thi' },
      { ten_hd: 'Workshop AI/ML', diem_ren_luyen: 6, loai: 'hoi_thao' },
      { ten_hd: 'Chạy bộ từ thiện', diem_ren_luyen: 4, loai: 'the_thao' },
      { ten_hd: 'Seminar Khởi nghiệp', diem_ren_luyen: 5, loai: 'hoi_thao' }
    ];

    const createdActivities = [];

    for (const semester of semesters) {
      for (const actType of activityTypes) {
        const existingActivity = await prisma.hoatDong.findFirst({
          where: {
            ten_hd: actType.ten_hd,
            hoc_ky: semester.hoc_ky,
            nam_hoc: semester.nam_hoc
          }
        });

        if (!existingActivity) {
          const startDate = new Date();
          startDate.setDate(startDate.getDate() + Math.floor(Math.random() * 30));
          const endDate = new Date(startDate);
          endDate.setDate(endDate.getDate() + 7);

          const activity = await prisma.hoatDong.create({
            data: {
              ten_hd: `${actType.ten_hd} - ${semester.label}`,
              mo_ta: `Hoạt động ${actType.ten_hd.toLowerCase()} cho ${semester.label}`,
              ngay_bd: startDate,
              ngay_kt: endDate,
              dia_diem: 'Hội trường A',
              so_luong_toi_da: 100,
              diem_ren_luyen: actType.diem_ren_luyen,
              hoc_ky: semester.hoc_ky,
              nam_hoc: semester.nam_hoc,
              is_active: true,
              created_at: new Date()
            }
          });
          createdActivities.push(activity);
          console.log(`   ✅ Tạo: ${activity.ten_hd}`);
        }
      }
    }

    if (createdActivities.length === 0) {
      console.log('   ℹ️  Đã có đủ hoạt động mẫu');
      // Get some existing activities for registration
      const existingActs = await prisma.hoatDong.findMany({ take: 10 });
      createdActivities.push(...existingActs);
    }
    console.log();

    // 4. TẠO ĐĂNG KÝ MẪU VỚI ĐA TRẠNG THÁI
    console.log('4️⃣  Tạo đăng ký mẫu với đa trạng thái...');
    
    const statuses = [
      { status: 'cho_duyet', count: 15, label: 'Chờ duyệt' },
      { status: 'da_duyet', count: 10, label: 'Đã duyệt' },
      { status: 'da_tham_gia', count: 8, label: 'Đã tham gia' },
      { status: 'tu_choi', count: 3, label: 'Từ chối' }
    ];

    let totalCreated = 0;

    for (const statusGroup of statuses) {
      for (let i = 0; i < statusGroup.count && i < students.length; i++) {
        const student = students[i % students.length];
        const activity = createdActivities[Math.floor(Math.random() * createdActivities.length)];

        // Check if registration already exists
        const existingReg = await prisma.dangKyHoatDong.findUnique({
          where: {
            sinh_vien_id_hoat_dong_id: {
              sinh_vien_id: student.sinh_vien_id,
              hoat_dong_id: activity.hoat_dong_id
            }
          }
        });

        if (!existingReg) {
          const regDate = new Date();
          regDate.setDate(regDate.getDate() - Math.floor(Math.random() * 30)); // Random past date

          await prisma.dangKyHoatDong.create({
            data: {
              sinh_vien_id: student.sinh_vien_id,
              hoat_dong_id: activity.hoat_dong_id,
              trang_thai_dk: statusGroup.status,
              ngay_dang_ky: regDate,
              ngay_duyet: statusGroup.status !== 'cho_duyet' ? new Date(regDate.getTime() + 24 * 60 * 60 * 1000) : null
            }
          });
          totalCreated++;
        }
      }
      console.log(`   ✅ Tạo ${statusGroup.count} đăng ký "${statusGroup.label}"`);
    }

    console.log(`   📊 Tổng số đăng ký mới: ${totalCreated}`);
    console.log();

    // 5. TẠO ĐĂNG KÝ HÔM NAY (cho todayApprovals stat)
    console.log('5️⃣  Tạo đăng ký duyệt hôm nay...');
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    for (let i = 0; i < 3 && i < students.length; i++) {
      const student = students[(i + 10) % students.length];
      const activity = createdActivities[i % createdActivities.length];

      const existingReg = await prisma.dangKyHoatDong.findUnique({
        where: {
          sinh_vien_id_hoat_dong_id: {
            sinh_vien_id: student.sinh_vien_id,
            hoat_dong_id: activity.hoat_dong_id
          }
        }
      });

      if (!existingReg) {
        await prisma.dangKyHoatDong.create({
          data: {
            sinh_vien_id: student.sinh_vien_id,
            hoat_dong_id: activity.hoat_dong_id,
            trang_thai_dk: 'da_duyet',
            ngay_dang_ky: new Date(today.getTime() - 24 * 60 * 60 * 1000),
            ngay_duyet: today
          }
        });
        console.log(`   ✅ Tạo đăng ký duyệt hôm nay cho ${student.nguoi_dung?.ho_ten || student.nguoi_dung?.ten_dn}`);
      }
    }
    console.log();

    // 6. THỐNG KÊ CUỐI CÙNG
    console.log('6️⃣  Thống kê sau khi seed...');
    
    const [
      finalActivities,
      finalRegistrations,
      finalPending,
      finalApproved,
      finalSemesters
    ] = await Promise.all([
      prisma.hoatDong.count(),
      prisma.dangKyHoatDong.count(),
      prisma.dangKyHoatDong.count({ where: { trang_thai_dk: 'cho_duyet' } }),
      prisma.dangKyHoatDong.count({ where: { trang_thai_dk: 'da_duyet' } }),
      prisma.hoatDong.findMany({
        select: { hoc_ky: true, nam_hoc: true },
        distinct: ['hoc_ky', 'nam_hoc'],
        where: { nam_hoc: { not: null } }
      })
    ]);

    console.log(`   📊 Tổng hoạt động: ${finalActivities}`);
    console.log(`   📊 Tổng đăng ký: ${finalRegistrations}`);
    console.log(`   📊 Chờ duyệt: ${finalPending}`);
    console.log(`   📊 Đã duyệt: ${finalApproved}`);
    console.log(`   📊 Học kỳ: ${finalSemesters.length}`);
    console.log();

    console.log('='.repeat(80));
    console.log('✅ HOÀN TẤT TẠO DỮ LIỆU MẪU!');
    console.log('='.repeat(80));
    console.log();
    console.log('💡 TIẾP THEO:');
    console.log('   1. Kiểm tra dữ liệu: node backend/scripts/check_admin_dashboard_data.js');
    console.log('   2. Reload trang admin dashboard để xem kết quả');
    console.log('   3. Kiểm tra 3 tab: Hoạt động gần đây, Danh sách học kỳ, Phê duyệt đăng ký');
    console.log('='.repeat(80));

  } catch (error) {
    console.error('❌ LỖI:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run the seed
seedAdminDashboardData()
  .catch(console.error);
