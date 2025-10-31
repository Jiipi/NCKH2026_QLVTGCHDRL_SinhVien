/**
 * Script: Reset mật khẩu người dùng (có tùy chọn)
 * 
 * CẢNH BÁO: Chỉ dùng cho development/test. KHÔNG dùng trong production!
 * 
 * Cách chạy:
 *   # Reset tất cả với mật khẩu 123456
 *   node scripts/reset_passwords_advanced.js
 * 
 *   # Reset với mật khẩu tùy chỉnh
 *   node scripts/reset_passwords_advanced.js --password=MyPassword123
 * 
 *   # Reset chỉ sinh viên
 *   node scripts/reset_passwords_advanced.js --role=SINH_VIEN
 * 
 *   # Reset người dùng cụ thể
 *   node scripts/reset_passwords_advanced.js --users=admin,gv001,sv001
 * 
 *   # Dry run (không thực sự thay đổi)
 *   node scripts/reset_passwords_advanced.js --dry-run
 */

const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

// Parse command line arguments
function parseArgs() {
  const args = process.argv.slice(2);
  const options = {
    password: '123456',
    role: null,
    users: null,
    dryRun: false
  };

  args.forEach(arg => {
    if (arg.startsWith('--password=')) {
      options.password = arg.split('=')[1];
    } else if (arg.startsWith('--role=')) {
      options.role = arg.split('=')[1].toUpperCase();
    } else if (arg.startsWith('--users=')) {
      options.users = arg.split('=')[1].split(',').map(u => u.trim());
    } else if (arg === '--dry-run') {
      options.dryRun = true;
    }
  });

  return options;
}

async function resetPasswords() {
  const options = parseArgs();
  
  console.log('🔐 RESET MẬT KHẨU NGƯỜI DÙNG');
  console.log('='.repeat(60));
  console.log(`Mật khẩu mới: ${options.password}`);
  console.log(`Vai trò lọc: ${options.role || 'Tất cả'}`);
  console.log(`Người dùng cụ thể: ${options.users ? options.users.join(', ') : 'Không'}`);
  console.log(`Chế độ: ${options.dryRun ? 'DRY RUN (không thay đổi thực tế)' : 'THỰC THI'}`);
  console.log('='.repeat(60) + '\n');

  try {
    // 1. Build query filter
    const whereClause = {};
    
    if (options.role) {
      whereClause.vai_tro = {
        ten_vt: options.role
      };
    }
    
    if (options.users && options.users.length > 0) {
      whereClause.ten_dn = {
        in: options.users
      };
    }

    // 2. Fetch users
    const users = await prisma.nguoiDung.findMany({
      where: whereClause,
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
      },
      orderBy: [
        { vai_tro: { ten_vt: 'asc' } },
        { ten_dn: 'asc' }
      ]
    });

    if (users.length === 0) {
      console.log('❌ Không tìm thấy người dùng nào phù hợp với bộ lọc!');
      return;
    }

    console.log(`📊 Tìm thấy ${users.length} người dùng\n`);

    // 3. Display users to be updated
    console.log('📋 DANH SÁCH NGƯỜI DÙNG SẼ CẬP NHẬT:');
    console.log('-'.repeat(60));
    
    const groupedByRole = {};
    users.forEach(user => {
      const role = user.vai_tro?.ten_vt || 'Unknown';
      if (!groupedByRole[role]) groupedByRole[role] = [];
      groupedByRole[role].push(user);
    });

    Object.keys(groupedByRole).forEach(role => {
      console.log(`\n${role} (${groupedByRole[role].length}):`);
      groupedByRole[role].forEach(user => {
        console.log(`  • ${user.ten_dn.padEnd(15)} - ${user.ho_ten || user.email || 'N/A'}`);
      });
    });

    console.log('\n' + '-'.repeat(60));

    // 4. Confirm if not dry run
    if (!options.dryRun) {
      console.log('\n⚠️  CẢNH BÁO: Bạn đang chuẩn bị thay đổi mật khẩu thực tế!');
      console.log('   Nhấn Ctrl+C trong 5 giây để hủy...\n');
      
      await new Promise(resolve => setTimeout(resolve, 5000));
    } else {
      console.log('\n🔍 DRY RUN - Không thực hiện thay đổi thực tế\n');
    }

    // 5. Hash password
    console.log('🔒 Đang hash mật khẩu...');
    const hashedPassword = await bcrypt.hash(options.password, 10);
    console.log(`✅ Hash: ${hashedPassword.substring(0, 30)}...\n`);

    // 6. Update passwords
    if (!options.dryRun) {
      console.log('🔄 Đang cập nhật mật khẩu...\n');

      let successCount = 0;
      let failCount = 0;

      for (const user of users) {
        try {
          await prisma.nguoiDung.update({
            where: { id: user.id },
            data: { mat_khau: hashedPassword }
          });
          console.log(`✅ ${user.ten_dn.padEnd(15)} (${user.vai_tro?.ten_vt || 'N/A'})`);
          successCount++;
        } catch (error) {
          console.error(`❌ ${user.ten_dn.padEnd(15)} - Lỗi: ${error.message}`);
          failCount++;
        }
      }

      console.log('\n' + '='.repeat(60));
      console.log('📊 KẾT QUẢ:');
      console.log(`   ✅ Thành công: ${successCount}/${users.length}`);
      console.log(`   ❌ Thất bại: ${failCount}/${users.length}`);
      console.log('='.repeat(60));

      if (successCount > 0) {
        console.log(`\n🎉 ${successCount} người dùng đã được cập nhật mật khẩu: ${options.password}`);
      }
    } else {
      console.log('✅ DRY RUN hoàn tất. Không có thay đổi nào được thực hiện.');
      console.log(`   ${users.length} người dùng sẽ được cập nhật nếu chạy thực tế.`);
    }

    // 7. Print login info
    if (!options.dryRun) {
      console.log('\n📝 THÔNG TIN ĐĂNG NHẬP:');
      console.log('-'.repeat(60));
      Object.keys(groupedByRole).forEach(role => {
        console.log(`\n${role}:`);
        groupedByRole[role].forEach(user => {
          console.log(`  Username: ${user.ten_dn.padEnd(15)} | Password: ${options.password}`);
        });
      });
    }

  } catch (error) {
    console.error('\n❌ LỖI:', error.message);
    console.error(error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

// Main
resetPasswords()
  .then(() => {
    console.log('\n✅ Script hoàn tất\n');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Script thất bại:', error);
    process.exit(1);
  });
