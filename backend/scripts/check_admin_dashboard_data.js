/**
 * Script kiểm tra dữ liệu cho Admin Dashboard
 * Kiểm tra: Hoạt động gần đây, Danh sách học kỳ, Phê duyệt đăng ký
 * 
 * Usage: node backend/scripts/check_admin_dashboard_data.js
 */

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkAdminDashboardData() {
  console.log('='.repeat(80));
  console.log('📊 KIỂM TRA DỮ LIỆU ADMIN DASHBOARD');
  console.log('='.repeat(80));
  console.log();

  try {
    // 1. KIỂM TRA HỌC KỲ
    console.log('1️⃣  DANH SÁCH HỌC KỲ');
    console.log('-'.repeat(80));
    
    const hoatDongs = await prisma.hoatDong.findMany({
      select: { hoc_ky: true, nam_hoc: true },
      distinct: ['hoc_ky', 'nam_hoc'],
      where: {
        nam_hoc: { not: null }
      }
    });

    console.log(`✅ Tìm thấy ${hoatDongs.length} học kỳ trong hệ thống:`);
    hoatDongs.forEach((hk, idx) => {
      const semNum = hk.hoc_ky === 'hoc_ky_1' ? '1' : '2';
      console.log(`   ${idx + 1}. Học kỳ ${semNum} - Năm học ${hk.nam_hoc}`);
    });
    
    if (hoatDongs.length === 0) {
      console.log('⚠️  CẢNH BÁO: Không có học kỳ nào! Tab "Danh sách học kỳ" sẽ trống.');
    }
    console.log();

    // 2. KIỂM TRA ĐĂNG KÝ CHỜ DUYỆT
    console.log('2️⃣  PHÊ DUYỆT ĐĂNG KÝ (Chờ duyệt)');
    console.log('-'.repeat(80));
    
    const pendingRegistrations = await prisma.dangKyHoatDong.findMany({
      where: { trang_thai_dk: 'cho_duyet' },
      include: {
        sinh_vien: {
          include: {
            nguoi_dung: { select: { ho_ten: true, ten_dn: true } },
            lop: { select: { ten_lop: true } }
          }
        },
        hoat_dong: {
          select: { ten_hd: true, hoc_ky: true, nam_hoc: true, ngay_bd: true }
        }
      },
      orderBy: { ngay_dang_ky: 'desc' },
      take: 20
    });

    console.log(`✅ Tìm thấy ${pendingRegistrations.length} đăng ký chờ duyệt:`);
    pendingRegistrations.slice(0, 10).forEach((reg, idx) => {
      const studentName = reg.sinh_vien?.nguoi_dung?.ho_ten || reg.sinh_vien?.nguoi_dung?.ten_dn || 'N/A';
      const activityName = reg.hoat_dong?.ten_hd || 'N/A';
      const className = reg.sinh_vien?.lop?.ten_lop || 'N/A';
      const regDate = reg.ngay_dang_ky ? new Date(reg.ngay_dang_ky).toLocaleDateString('vi-VN') : 'N/A';
      console.log(`   ${idx + 1}. ${studentName} (${className}) - ${activityName}`);
      console.log(`      Ngày đăng ký: ${regDate}`);
    });
    
    if (pendingRegistrations.length === 0) {
      console.log('⚠️  CẢNH BÁO: Không có đăng ký chờ duyệt! Tab "Phê duyệt đăng ký" sẽ trống.');
    }
    console.log();

    // 3. KIỂM TRA HOẠT ĐỘNG GẦN ĐÂY (Tất cả trạng thái)
    console.log('3️⃣  HOẠT ĐỘNG GẦN ĐÂY (10 đăng ký mới nhất)');
    console.log('-'.repeat(80));
    
    const recentRegistrations = await prisma.dangKyHoatDong.findMany({
      include: {
        sinh_vien: {
          include: {
            nguoi_dung: { select: { ho_ten: true, ten_dn: true } },
            lop: { select: { ten_lop: true } }
          }
        },
        hoat_dong: {
          select: { ten_hd: true, hoc_ky: true, nam_hoc: true }
        }
      },
      orderBy: { ngay_dang_ky: 'desc' },
      take: 10
    });

    console.log(`✅ Tìm thấy ${recentRegistrations.length} đăng ký gần đây:`);
    recentRegistrations.forEach((reg, idx) => {
      const studentName = reg.sinh_vien?.nguoi_dung?.ho_ten || reg.sinh_vien?.nguoi_dung?.ten_dn || 'N/A';
      const activityName = reg.hoat_dong?.ten_hd || 'N/A';
      const status = reg.trang_thai_dk;
      const statusLabel = status === 'da_duyet' ? '✅ Đã duyệt' 
        : status === 'da_tham_gia' ? '✅ Đã tham gia'
        : status === 'cho_duyet' ? '⏳ Chờ duyệt' 
        : status === 'tu_choi' ? '❌ Từ chối' : status;
      const regDate = reg.ngay_dang_ky ? new Date(reg.ngay_dang_ky).toLocaleDateString('vi-VN') : 'N/A';
      console.log(`   ${idx + 1}. [${statusLabel}] ${studentName} - ${activityName}`);
      console.log(`      Ngày: ${regDate}`);
    });
    
    if (recentRegistrations.length === 0) {
      console.log('⚠️  CẢNH BÁO: Không có đăng ký nào! Tab "Hoạt động gần đây" sẽ trống.');
    }
    console.log();

    // 4. THỐNG KÊ TỔNG QUAN
    console.log('4️⃣  THỐNG KÊ TỔNG QUAN');
    console.log('-'.repeat(80));
    
    const [
      totalUsers,
      totalActivities,
      totalRegistrations,
      activeUsers,
      pendingCount,
      approvedCount,
      participatedCount,
      rejectedCount
    ] = await Promise.all([
      prisma.nguoiDung.count(),
      prisma.hoatDong.count(),
      prisma.dangKyHoatDong.count(),
      prisma.nguoiDung.count({ where: { trang_thai: 'hoat_dong' } }),
      prisma.dangKyHoatDong.count({ where: { trang_thai_dk: 'cho_duyet' } }),
      prisma.dangKyHoatDong.count({ where: { trang_thai_dk: 'da_duyet' } }),
      prisma.dangKyHoatDong.count({ where: { trang_thai_dk: 'da_tham_gia' } }),
      prisma.dangKyHoatDong.count({ where: { trang_thai_dk: 'tu_choi' } })
    ]);

    console.log(`📊 Tổng người dùng: ${totalUsers} (Hoạt động: ${activeUsers})`);
    console.log(`📊 Tổng hoạt động: ${totalActivities}`);
    console.log(`📊 Tổng đăng ký: ${totalRegistrations}`);
    console.log(`   - Chờ duyệt: ${pendingCount}`);
    console.log(`   - Đã duyệt: ${approvedCount}`);
    console.log(`   - Đã tham gia: ${participatedCount}`);
    console.log(`   - Từ chối: ${rejectedCount}`);
    console.log();

    // 5. KIỂM TRA LỚP HỌC VÀ GIÁO VIÊN
    console.log('5️⃣  KIỂM TRA LỚP HỌC VÀ GIÁO VIÊN');
    console.log('-'.repeat(80));
    
    const classes = await prisma.lop.findMany({
      include: {
        _count: { select: { sinh_viens: true } },
        chu_nhiem_rel: { select: { ho_ten: true, ten_dn: true } }
      },
      take: 5
    });

    console.log(`✅ Tìm thấy ${classes.length} lớp (hiển thị 5 lớp đầu):`);
    classes.forEach((c, idx) => {
      const teacherName = c.chu_nhiem_rel?.ho_ten || c.chu_nhiem_rel?.ten_dn || 'Chưa có GVCN';
      console.log(`   ${idx + 1}. ${c.ten_lop} - ${c._count.sinh_viens} sinh viên - GVCN: ${teacherName}`);
    });
    console.log();

    // 6. KIỂM TRA VAI TRÒ
    console.log('6️⃣  KIỂM TRA VAI TRÒ');
    console.log('-'.repeat(80));
    
    const roles = await prisma.vaiTro.findMany({
      include: {
        _count: { select: { nguoi_dungs: true } }
      }
    });

    console.log(`✅ Tìm thấy ${roles.length} vai trò:`);
    roles.forEach((r, idx) => {
      console.log(`   ${idx + 1}. ${r.ten_vt} - ${r._count.nguoi_dungs} người dùng`);
    });
    console.log();

    // 7. KẾT LUẬN
    console.log('='.repeat(80));
    console.log('📝 KẾT LUẬN VÀ KHUYẾN NGHỊ');
    console.log('='.repeat(80));
    
    const issues = [];
    
    if (hoatDongs.length === 0) {
      issues.push('❌ KHÔNG CÓ HỌC KỲ: Cần tạo hoạt động với hoc_ky và nam_hoc');
    }
    
    if (pendingRegistrations.length === 0) {
      issues.push('⚠️  KHÔNG CÓ ĐĂNG KÝ CHỜ DUYỆT: Có thể tạo đăng ký mẫu hoặc chờ user đăng ký');
    }
    
    if (recentRegistrations.length === 0) {
      issues.push('❌ KHÔNG CÓ ĐĂNG KÝ NÀO: Cần tạo dữ liệu mẫu cho đăng ký hoạt động');
    }

    if (classes.length === 0) {
      issues.push('❌ KHÔNG CÓ LỚP HỌC: Tab sidebar sẽ trống');
    }

    const teacherRole = roles.find(r => 
      r.ten_vt.toUpperCase().includes('GIANG') || 
      r.ten_vt.toUpperCase().includes('VIEN') ||
      r.ten_vt === 'GV'
    );
    
    if (!teacherRole || teacherRole._count.nguoi_dungs === 0) {
      issues.push('⚠️  KHÔNG CÓ GIÁO VIÊN: Tab sidebar giảng viên sẽ trống');
    }

    if (issues.length === 0) {
      console.log('✅ HỆ THỐNG CÓ ĐỦ DỮ LIỆU CHO ADMIN DASHBOARD!');
      console.log('✅ Tất cả 3 tab sẽ hiển thị dữ liệu bình thường.');
    } else {
      console.log('⚠️  PHÁT HIỆN CÁC VẤN ĐỀ:');
      issues.forEach(issue => console.log(`   ${issue}`));
      console.log();
      console.log('💡 ĐỀ XUẤT: Chạy script seed dữ liệu mẫu:');
      console.log('   node backend/scripts/seed_admin_dashboard_data.js');
    }
    console.log('='.repeat(80));

  } catch (error) {
    console.error('❌ LỖI:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run the check
checkAdminDashboardData()
  .catch(console.error);
