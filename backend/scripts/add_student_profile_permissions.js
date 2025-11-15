/**
 * Script: Add profile.read and profile.update permissions to SINH_VIEN role
 * Fix: Students getting 403 when accessing /users/profile
 */

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function addStudentProfilePermissions() {
  try {
    console.log('🔍 Checking SINH_VIEN role permissions...\n');

    // Find SINH_VIEN role using Prisma schema names
    const studentRole = await prisma.vaiTro.findFirst({
      where: { ten_vt: 'SINH_VIEN' }
    });

    if (!studentRole) {
      console.error('❌ SINH_VIEN role not found!');
      return;
    }

    console.log(`✅ Found role: ${studentRole.ten_vt} (ID: ${studentRole.id})`);
    console.log(`   Current permissions: ${JSON.stringify(studentRole.quyen_han, null, 2)}\n`);

    // Parse current permissions
    let permissions = [];
    if (studentRole.quyen_han && Array.isArray(studentRole.quyen_han)) {
      permissions = studentRole.quyen_han;
    }

    // Add profile permissions if not present
    const profilePermissions = ['profile.read', 'profile.update'];
    let updated = false;

    for (const perm of profilePermissions) {
      if (!permissions.includes(perm)) {
        permissions.push(perm);
        console.log(`✅ Adding: ${perm}`);
        updated = true;
      } else {
        console.log(`✓ ${perm} - already exists`);
      }
    }

    if (updated) {
      await prisma.vaiTro.update({
        where: { id: studentRole.id },
        data: { quyen_han: permissions }
      });
      console.log('\n✅ Profile permissions ADDED to SINH_VIEN role');
    } else {
      console.log('\n✓ All profile permissions already exist');
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run
addStudentProfilePermissions()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
