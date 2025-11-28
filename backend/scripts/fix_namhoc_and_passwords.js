/**
 * Script: fix_namhoc_and_passwords.js
 * 
 * Chức năng:
 * 1. Chuyển tất cả HoatDong.nam_hoc từ năm kép (VD: '2024-2025') sang năm đơn ('2024')
 * 2. Reset mật khẩu tất cả user (NguoiDung) về '123456'
 * 
 * Chạy: node scripts/fix_namhoc_and_passwords.js
 */

const { PrismaClient } = require('@prisma/client');
// bcrypt có thể là bcrypt hoặc bcryptjs tùy cài đặt
let bcrypt;
try {
  bcrypt = require('bcrypt');
} catch {
  bcrypt = require('bcryptjs');
}

const prisma = new PrismaClient();

// Cấu hình
const CONFIG = {
  NAM_HOC_LIST: ['2024', '2025', '2026', '2027', '2028'], // Danh sách năm đơn
  HOC_KY: 'hoc_ky_1', // Cố định học kỳ 1 để dropdown chỉ hiện 5 năm
  MAT_KHAU_MOI: '123456',     // Mật khẩu mới cho tất cả user
  SALT_ROUNDS: 10,
};

async function fixNamHoc() {
  console.log('\n========== PHÂN BỐ NĂM HỌC (2024-2028) ==========');
  
  // Thống kê trước khi sửa
  const before = await prisma.hoatDong.groupBy({
    by: ['nam_hoc', 'hoc_ky'],
    _count: { _all: true },
  });
  console.log('Trước khi sửa - Phân bố nam_hoc + hoc_ky:');
  before.forEach(item => {
    console.log(`  - "${item.hoc_ky}" + "${item.nam_hoc}": ${item._count._all} hoạt động`);
  });

  // Lấy tất cả hoạt động
  const allActivities = await prisma.hoatDong.findMany({
    select: { id: true },
    orderBy: { id: 'asc' },
  });
  
  const total = allActivities.length;
  const perYear = Math.ceil(total / CONFIG.NAM_HOC_LIST.length);
  
  console.log(`\nTổng: ${total} hoạt động, chia đều ~${perYear} hoạt động/năm`);
  console.log(`Cố định học kỳ: ${CONFIG.HOC_KY}`);
  
  // Phân bố đều hoạt động theo năm + cố định hoc_ky
  for (let i = 0; i < CONFIG.NAM_HOC_LIST.length; i++) {
    const namHoc = CONFIG.NAM_HOC_LIST[i];
    const startIdx = i * perYear;
    const endIdx = Math.min((i + 1) * perYear, total);
    const ids = allActivities.slice(startIdx, endIdx).map(a => a.id);
    
    if (ids.length > 0) {
      await prisma.hoatDong.updateMany({
        where: { id: { in: ids } },
        data: { 
          nam_hoc: namHoc,
          hoc_ky: CONFIG.HOC_KY // Cố định học kỳ
        },
      });
      console.log(`  ✅ Năm ${namHoc} (${CONFIG.HOC_KY}): ${ids.length} hoạt động`);
    }
  }

  // Thống kê sau khi sửa
  const after = await prisma.hoatDong.groupBy({
    by: ['nam_hoc'],
    _count: { _all: true },
  });
  console.log('\nSau khi sửa - Phân bố nam_hoc (tất cả đều là hoc_ky_1):');
  after.forEach(item => {
    console.log(`  - "${item.nam_hoc}": ${item._count._all} hoạt động`);
  });
}

async function fixPasswords() {
  console.log('\n========== RESET MẬT KHẨU ==========');
  
  // Hash mật khẩu mới
  const hashedPassword = await bcrypt.hash(CONFIG.MAT_KHAU_MOI, CONFIG.SALT_ROUNDS);
  
  // Đếm số user
  const totalUsers = await prisma.nguoiDung.count();
  console.log(`Tổng số user trong hệ thống: ${totalUsers}`);
  
  // Cập nhật mật khẩu tất cả user
  const result = await prisma.nguoiDung.updateMany({
    data: { mat_khau: hashedPassword },
  });
  
  console.log(`\n✅ Đã reset mật khẩu cho ${result.count} user về '${CONFIG.MAT_KHAU_MOI}'`);
  
  // Liệt kê các user để tiện đăng nhập
  const users = await prisma.nguoiDung.findMany({
    select: {
      ten_dn: true,
      ho_ten: true,
      vai_tro: { select: { ten_vt: true } },
    },
    take: 20, // Chỉ hiển thị 20 user đầu tiên
    orderBy: { id: 'asc' },
  });
  
  console.log('\n📋 Một số tài khoản mẫu (mật khẩu: 123456):');
  console.log('─'.repeat(60));
  users.forEach(u => {
    const role = u.vai_tro?.ten_vt || 'N/A';
    console.log(`  ${u.ten_dn.padEnd(20)} | ${role.padEnd(15)} | ${u.ho_ten}`);
  });
  console.log('─'.repeat(60));
}

async function main() {
  console.log('╔════════════════════════════════════════════════════════════╗');
  console.log('║     SCRIPT SỬA NĂM HỌC VÀ RESET MẬT KHẨU                   ║');
  console.log('╚════════════════════════════════════════════════════════════╝');
  console.log(`\nCấu hình:`);
  console.log(`  - Năm học mới: ${CONFIG.NAM_HOC_MOI}`);
  console.log(`  - Mật khẩu mới: ${CONFIG.MAT_KHAU_MOI}`);
  
  try {
    await fixNamHoc();
    await fixPasswords();
    
    console.log('\n════════════════════════════════════════════════════════════');
    console.log('✅ HOÀN TẤT! Tất cả hoạt động đã có năm học đơn, tất cả user');
    console.log('   đều có mật khẩu là 123456.');
    console.log('════════════════════════════════════════════════════════════\n');
  } catch (error) {
    console.error('\n❌ Lỗi:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
