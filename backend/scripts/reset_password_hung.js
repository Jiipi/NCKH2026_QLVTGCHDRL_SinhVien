const bcrypt = require('bcryptjs');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function resetPassword() {
  try {
    const newPassword = 'test123';
    const hashed = await bcrypt.hash(newPassword, 10);
    
    await prisma.nguoiDung.update({
      where: { ten_dn: '2212377' },
      data: { mat_khau: hashed }
    });
    
    console.log('✅ Đã reset mật khẩu cho user 2212377 (hung)');
    console.log('   MSSV: 2212377');
    console.log('   Mật khẩu mới: test123');
    
  } catch (error) {
    console.error('❌ Lỗi:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

resetPassword();
