/**
 * Script: Xóa quyền điểm danh (attendance) khỏi vai trò GIANG_VIEN
 * Chạy: node backend/scripts/remove_attendance_from_teacher.js
 */
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('🔧 Xóa quyền điểm danh khỏi vai trò GIANG_VIEN...\n');

  const teacherRole = await prisma.vaiTro.findUnique({ 
    where: { ten_vt: 'GIANG_VIEN' } 
  });

  if (!teacherRole) {
    console.log('❌ Không tìm thấy vai trò GIANG_VIEN');
    return;
  }

  let permissions = teacherRole.quyen_han || [];
  
  // Normalize if string
  if (typeof permissions === 'string') {
    try { 
      permissions = JSON.parse(permissions); 
    } catch (e) { 
      permissions = []; 
    }
  }

  console.log('📋 Quyền hiện tại:', permissions.length, 'quyền');
  
  // Các quyền attendance cần xóa
  const attendancePerms = [
    'attendance.view',
    'attendance.mark', 
    'attendance.read',
    'attendance.write',
    'attendance.delete'
  ];

  const originalLength = permissions.length;
  const removedPerms = [];

  // Xóa các quyền attendance
  permissions = permissions.filter(perm => {
    if (attendancePerms.includes(perm)) {
      removedPerms.push(perm);
      return false;
    }
    return true;
  });

  if (removedPerms.length > 0) {
    await prisma.vaiTro.update({
      where: { id: teacherRole.id },
      data: { quyen_han: permissions }
    });
    
    console.log('\n✅ Đã xóa các quyền sau khỏi GIANG_VIEN:');
    removedPerms.forEach(p => console.log(`   - ${p}`));
    console.log(`\n📊 Tổng: ${originalLength} → ${permissions.length} quyền`);
  } else {
    console.log('\n✅ GIANG_VIEN không có quyền attendance nào để xóa');
  }
}

main()
  .catch(e => console.error('❌ Lỗi:', e))
  .finally(async () => await prisma.$disconnect());
