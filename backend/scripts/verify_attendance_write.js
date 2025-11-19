/**
 * Script để kiểm tra và đảm bảo attendance.write có trong role SINH_VIEN
 * Usage: node scripts/verify_attendance_write.js
 */

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function verifyAttendanceWrite() {
  try {
    // Tìm role SINH_VIEN
    const sinhVienRole = await prisma.vaiTro.findUnique({
      where: { ten_vt: 'SINH_VIEN' }
    });

    if (!sinhVienRole) {
      console.log('❌ Không tìm thấy role SINH_VIEN');
      return;
    }

    console.log('\n=== KIỂM TRA ROLE SINH_VIEN ===');
    
    // Normalize permissions
    let permissions = sinhVienRole.quyen_han || [];
    
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

    console.log('Số lượng permissions:', permissions.length);
    console.log('Có attendance.write:', permissions.includes('attendance.write'));
    console.log('Có attendance.mark:', permissions.includes('attendance.mark'));

    if (!permissions.includes('attendance.write')) {
      console.log('\n❌ Role SINH_VIEN CHƯA có attendance.write!');
      console.log('Đang thêm attendance.write...');
      
      const updatedPermissions = [...permissions, 'attendance.write'];
      const uniquePermissions = [...new Set(updatedPermissions)].sort();

      await prisma.vaiTro.update({
        where: { id: sinhVienRole.id },
        data: { quyen_han: uniquePermissions }
      });

      console.log('✅ Đã thêm attendance.write thành công!');
      console.log('Permissions mới:', uniquePermissions.length);
    } else {
      console.log('\n✅ Role SINH_VIEN đã có attendance.write!');
    }

    // Kiểm tra tất cả users có role SINH_VIEN
    console.log('\n=== KIỂM TRA USERS ===');
    const users = await prisma.nguoiDung.findMany({
      where: { vai_tro_id: sinhVienRole.id },
      select: {
        id: true,
        ten_dn: true,
        ho_ten: true
      },
      take: 5
    });

    console.log(`Tìm thấy ${users.length} users (hiển thị 5 đầu):`);
    users.forEach((user, index) => {
      console.log(`${index + 1}. ${user.ten_dn} - ${user.ho_ten || 'N/A'}`);
    });

    console.log('\n⚠️  Lưu ý:');
    console.log('   - Cache đã được tắt (CACHE_TTL = 0)');
    console.log('   - User cần logout và login lại để refresh JWT token');
    console.log('   - Hoặc đợi JWT token hết hạn và login lại');

  } catch (error) {
    console.error('❌ Lỗi:', error);
  } finally {
    await prisma.$disconnect();
  }
}

verifyAttendanceWrite();

