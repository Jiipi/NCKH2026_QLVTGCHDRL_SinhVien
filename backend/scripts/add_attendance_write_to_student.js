/**
 * Script để thêm attendance.write vào role SINH_VIEN
 * Usage: node scripts/add_attendance_write_to_student.js
 */

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function addAttendanceWriteToStudent() {
  try {
    // Tìm role SINH_VIEN
    const sinhVienRole = await prisma.vaiTro.findUnique({
      where: { ten_vt: 'SINH_VIEN' }
    });

    if (!sinhVienRole) {
      console.log('❌ Không tìm thấy role SINH_VIEN');
      return;
    }

    console.log('\n=== THÔNG TIN ROLE HIỆN TẠI ===');
    console.log('ID:', sinhVienRole.id);
    console.log('Tên vai trò:', sinhVienRole.ten_vt);
    console.log('Mô tả:', sinhVienRole.mo_ta);
    
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

    console.log('\n=== PERMISSIONS HIỆN TẠI ===');
    console.log('Số lượng:', permissions.length);
    console.log('Có attendance.write:', permissions.includes('attendance.write'));
    console.log('Có attendance.mark:', permissions.includes('attendance.mark'));

    // Kiểm tra xem đã có attendance.write chưa
    if (permissions.includes('attendance.write')) {
      console.log('\n✅ Role SINH_VIEN đã có attendance.write rồi!');
      return;
    }

    // Thêm attendance.write vào permissions
    const updatedPermissions = [...permissions, 'attendance.write'];
    
    // Sắp xếp và loại bỏ duplicate
    const uniquePermissions = [...new Set(updatedPermissions)].sort();

    console.log('\n=== CẬP NHẬT PERMISSIONS ===');
    console.log('Permissions mới:', uniquePermissions);
    console.log('Số lượng mới:', uniquePermissions.length);

    // Cập nhật database
    await prisma.vaiTro.update({
      where: { id: sinhVienRole.id },
      data: { quyen_han: uniquePermissions }
    });

    console.log('\n✅ Đã thêm attendance.write vào role SINH_VIEN thành công!');
    console.log('\n⚠️  Lưu ý:');
    console.log('   - Cache permissions sẽ tự động hết hạn sau 2 giây');
    console.log('   - Hoặc user cần logout và login lại để refresh permissions');

  } catch (error) {
    console.error('❌ Lỗi:', error);
  } finally {
    await prisma.$disconnect();
  }
}

addAttendanceWriteToStudent();

