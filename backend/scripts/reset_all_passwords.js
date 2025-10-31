/**
 * Script: Reset tất cả mật khẩu người dùng thành 123456
 * 
 * CẢNH BÁO: Script này sẽ đổi mật khẩu của TẤT CẢ người dùng trong hệ thống!
 * Chỉ sử dụng cho môi trường development/test.
 * KHÔNG BAO GIỜ chạy trong production!
 * 
 * Cách chạy:
 *   cd backend
 *   node scripts/reset_all_passwords.js
 */

const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

const NEW_PASSWORD = '123456';
const SALT_ROUNDS = 10;

async function resetAllPasswords() {
  console.log('🔐 Bắt đầu reset mật khẩu tất cả người dùng...\n');
  
  try {
    // 1. Lấy tất cả người dùng
    const users = await prisma.nguoiDung.findMany({
      select: {
        id: true,
        ten_dn: true,
        email: true,
        ho_ten: true,
        vai_tro: {
          select: {
            ten_vt: true
          }
        }
      }
    });

    if (users.length === 0) {
      console.log('❌ Không tìm thấy người dùng nào trong hệ thống!');
      return;
    }

    console.log(`📊 Tìm thấy ${users.length} người dùng\n`);

    // 2. Hash mật khẩu mới
    console.log('🔒 Đang hash mật khẩu mới...');
    const hashedPassword = await bcrypt.hash(NEW_PASSWORD, SALT_ROUNDS);
    console.log(`✅ Password hash: ${hashedPassword.substring(0, 20)}...\n`);

    // 3. Confirm trước khi thực hiện
    console.log('⚠️  CẢNH BÁO: Bạn đang chuẩn bị đổi mật khẩu của TẤT CẢ người dùng!');
    console.log(`   Mật khẩu mới: ${NEW_PASSWORD}`);
    console.log(`   Số người dùng: ${users.length}\n`);

    // Trong môi trường tự động, bỏ qua confirm
    // Nếu muốn có confirm, uncomment dòng dưới và cài package readline-sync
    // const readline = require('readline-sync');
    // const confirm = readline.question('Nhập "YES" để xác nhận: ');
    // if (confirm !== 'YES') {
    //   console.log('❌ Hủy bỏ thao tác');
    //   return;
    // }

    // 4. Update mật khẩu cho tất cả người dùng
    console.log('🔄 Đang cập nhật mật khẩu...\n');

    const updatePromises = users.map(async (user) => {
      try {
        await prisma.nguoiDung.update({
          where: { id: user.id },
          data: { mat_khau: hashedPassword }
        });
        console.log(`✅ ${user.ten_dn} (${user.vai_tro?.ten_vt || 'N/A'}) - ${user.ho_ten || user.email}`);
        return { success: true, user };
      } catch (error) {
        console.error(`❌ ${user.ten_dn} - Lỗi: ${error.message}`);
        return { success: false, user, error };
      }
    });

    const results = await Promise.all(updatePromises);

    // 5. Thống kê kết quả
    const successCount = results.filter(r => r.success).length;
    const failCount = results.filter(r => !r.success).length;

    console.log('\n' + '='.repeat(60));
    console.log('📊 KẾT QUẢ:');
    console.log(`   ✅ Thành công: ${successCount}/${users.length}`);
    console.log(`   ❌ Thất bại: ${failCount}/${users.length}`);
    console.log('='.repeat(60));

    if (successCount > 0) {
      console.log('\n🎉 Hoàn tất! Tất cả người dùng giờ có thể đăng nhập với mật khẩu: 123456');
      console.log('\n📋 DANH SÁCH TÀI KHOẢN:');
      console.log('-'.repeat(60));
      
      // Group by role
      const groupedUsers = {};
      results.filter(r => r.success).forEach(({ user }) => {
        const role = user.vai_tro?.ten_vt || 'Unknown';
        if (!groupedUsers[role]) groupedUsers[role] = [];
        groupedUsers[role].push(user);
      });

      Object.keys(groupedUsers).forEach(role => {
        console.log(`\n${role}:`);
        groupedUsers[role].forEach(user => {
          console.log(`  - Username: ${user.ten_dn.padEnd(15)} | Password: 123456 | Name: ${user.ho_ten || user.email || 'N/A'}`);
        });
      });
    }

    if (failCount > 0) {
      console.log('\n⚠️  Một số người dùng không được cập nhật. Kiểm tra lỗi ở trên.');
    }

  } catch (error) {
    console.error('\n❌ LỖI:', error.message);
    console.error(error);
  } finally {
    await prisma.$disconnect();
  }
}

// Chạy script
resetAllPasswords()
  .then(() => {
    console.log('\n✅ Script hoàn tất');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Script thất bại:', error);
    process.exit(1);
  });
