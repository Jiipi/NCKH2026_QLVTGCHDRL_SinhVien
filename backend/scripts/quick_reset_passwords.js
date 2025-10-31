/**
 * Script: QUICK Reset - Đổi tất cả mật khẩu thành 123456
 * 
 * Script đơn giản, chạy nhanh, không confirm
 * CHỈ DÙNG CHO DEVELOPMENT/TEST!
 * 
 * Cách chạy:
 *   cd backend
 *   node scripts/quick_reset_passwords.js
 */

// Load environment variables
require('dotenv').config();

const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function quickReset() {
  console.log('⚡ QUICK RESET - Đổi tất cả mật khẩu thành 123456\n');

  try {
    // Hash password
    const hashedPassword = await bcrypt.hash('123456', 10);

    // Update all users at once
    const result = await prisma.nguoiDung.updateMany({
      data: {
        mat_khau: hashedPassword
      }
    });

    console.log(`✅ Đã cập nhật ${result.count} người dùng`);
    console.log('🔑 Mật khẩu mới: 123456\n');

    // Fetch and display users
    const users = await prisma.nguoiDung.findMany({
      select: {
        ten_dn: true,
        vai_tro: { select: { ten_vt: true } }
      },
      orderBy: { ten_dn: 'asc' }
    });

    console.log('📋 DANH SÁCH TÀI KHOẢN:');
    console.log('-'.repeat(40));
    users.forEach(user => {
      console.log(`${user.ten_dn.padEnd(20)} | ${user.vai_tro?.ten_vt || 'N/A'}`);
    });
    console.log('-'.repeat(40));
    console.log('🔑 Tất cả password: 123456\n');

  } catch (error) {
    console.error('❌ Lỗi:', error.message);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

quickReset()
  .then(() => process.exit(0))
  .catch(() => process.exit(1));
