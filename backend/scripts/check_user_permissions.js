/**
 * Script để kiểm tra permissions của user
 * Usage: node scripts/check_user_permissions.js <user_id hoặc ten_dn>
 */

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkUserPermissions(identifier) {
  try {
    // Kiểm tra xem identifier có phải UUID không (36 ký tự với dấu gạch ngang)
    const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(identifier);
    
    // Tìm user theo ID hoặc ten_dn
    const whereClause = isUUID 
      ? { OR: [{ id: identifier }, { ten_dn: identifier }] }
      : { ten_dn: identifier };
    
    const user = await prisma.nguoiDung.findFirst({
      where: whereClause,
      include: {
        vai_tro: {
          select: {
            id: true,
            ten_vt: true,
            mo_ta: true,
            quyen_han: true
          }
        }
      }
    });

    if (!user) {
      console.log('❌ Không tìm thấy user với identifier:', identifier);
      return;
    }

    console.log('\n=== THÔNG TIN USER ===');
    console.log('ID:', user.id);
    console.log('Tên đăng nhập:', user.ten_dn);
    console.log('Họ tên:', user.ho_ten);
    console.log('Email:', user.email);
    console.log('\n=== THÔNG TIN VAI TRÒ ===');
    console.log('Vai trò ID:', user.vai_tro.id);
    console.log('Tên vai trò:', user.vai_tro.ten_vt);
    console.log('Mô tả:', user.vai_tro.mo_ta);
    
    console.log('\n=== PERMISSIONS (RAW) ===');
    console.log('Type:', typeof user.vai_tro.quyen_han);
    console.log('Is Array:', Array.isArray(user.vai_tro.quyen_han));
    console.log('Value:', JSON.stringify(user.vai_tro.quyen_han, null, 2));

    // Normalize permissions
    let permissions = user.vai_tro.quyen_han || [];
    
    if (permissions && typeof permissions === 'object' && !Array.isArray(permissions)) {
      if (Array.isArray(permissions.permissions)) {
        permissions = permissions.permissions;
      } else {
        permissions = Object.values(permissions);
      }
    }
    
    if (!Array.isArray(permissions)) {
      permissions = [];
    }

    console.log('\n=== PERMISSIONS (NORMALIZED) ===');
    console.log('Số lượng permissions:', permissions.length);
    console.log('Permissions:', permissions);

    // Kiểm tra các permissions liên quan đến attendance
    console.log('\n=== KIỂM TRA ATTENDANCE PERMISSIONS ===');
    console.log('attendance.view:', permissions.includes('attendance.view'));
    console.log('attendance.mark:', permissions.includes('attendance.mark'));
    console.log('attendance.write:', permissions.includes('attendance.write'));
    console.log('attendance.manage:', permissions.includes('attendance.manage'));

    // Kiểm tra các permissions khác
    console.log('\n=== TẤT CẢ PERMISSIONS ===');
    permissions.forEach((perm, index) => {
      console.log(`${index + 1}. ${perm}`);
    });

  } catch (error) {
    console.error('❌ Lỗi:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Lấy argument từ command line
const identifier = process.argv[2];

if (!identifier) {
  console.log('Usage: node scripts/check_user_permissions.js <user_id hoặc ten_dn>');
  console.log('Ví dụ: node scripts/check_user_permissions.js 202101002');
  process.exit(1);
}

checkUserPermissions(identifier);

