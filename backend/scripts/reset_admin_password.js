/**
 * Script: Reset Admin Password
 * Mục đích: Reset mật khẩu admin về '123456'
 * Cách chạy: node backend/scripts/reset_admin_password.js
 */

const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function resetAdminPassword() {
  try {
    console.log('🔄 Đang reset mật khẩu admin...\n');

    // Mật khẩu mới
    const newPassword = '123456';
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Tìm và update user admin
    const admin = await prisma.nguoiDung.findFirst({
      where: { ten_dn: 'admin' }
    });

    if (!admin) {
      console.error('❌ Không tìm thấy user admin trong database!');
      console.log('💡 Hãy chạy seed script để tạo user admin.');
      return;
    }

    // Update password
    await prisma.nguoiDung.update({
      where: { id: admin.id },
      data: { 
        mat_khau: hashedPassword,
        ngay_cap_nhat: new Date()
      }
    });

    console.log('✅ Reset mật khẩu thành công!');
    console.log('\n📋 Thông tin đăng nhập:');
    console.log('   Username: admin');
    console.log('   Password: 123456');
    console.log('   Email:', admin.email);
    console.log('\n🌐 Đăng nhập tại: http://localhost:3000/login\n');

  } catch (error) {
    console.error('❌ Lỗi khi reset mật khẩu:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Chạy script
resetAdminPassword()
  .catch((error) => {
    console.error('Fatal error:', error);
    process.exit(1);
  });
