/**
 * Fix SINH_VIEN permissions to match correct role permissions
 * 
 * SINH_VIEN should ONLY have these permissions:
 * - activities.view (read approved activities)
 * - registrations.register (register for activities)
 * - registrations.cancel (cancel own registrations)
 * - registrations.view (view own registrations)
 * - attendance.view (view own attendance)
 * - notifications.view (read notifications)
 * - profile.read (view own profile)
 * - profile.update (update own profile)
 * - points.view_own (view own points)
 * 
 * Remove ALL other permissions (admin/system/management permissions)
 */

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const CORRECT_SINH_VIEN_PERMISSIONS = [
  // Activities - only view approved activities
  'activities.view',
  
  // Registrations - register and cancel own registrations
  'registrations.register',
  'registrations.cancel',
  'registrations.view',
  
  // Attendance - view own attendance
  'attendance.view',
  
  // Notifications - view only
  'notifications.view',
  
  // Profile - view and update own profile
  'profile.read',
  'profile.update',
  
  // Points - view own points only
  'points.view_own'
];

async function fixStudentPermissions() {
  console.log('\n🔧 FIXING SINH_VIEN PERMISSIONS\n');
  console.log('━'.repeat(60));
  
  try {
    // Find SINH_VIEN role
    const sinhVienRole = await prisma.vai_tro.findFirst({
      where: {
        OR: [
          { ten_vt: 'SINH_VIEN' },
          { ten_vt: 'SINH_VIÊN' },
          { ten_vt: { contains: 'SINH_VI' } }
        ]
      }
    });

    if (!sinhVienRole) {
      console.error('❌ Cannot find SINH_VIEN role in database!');
      return;
    }

    console.log(`✓ Found role: ${sinhVienRole.ten_vt} (ID: ${sinhVienRole.id})`);
    
    // Show current permissions
    const currentPerms = Array.isArray(sinhVienRole.quyen_han) 
      ? sinhVienRole.quyen_han 
      : (typeof sinhVienRole.quyen_han === 'object' && sinhVienRole.quyen_han !== null)
        ? Object.values(sinhVienRole.quyen_han)
        : [];
    
    console.log(`\n📋 Current permissions (${currentPerms.length}):`);
    currentPerms.forEach(p => console.log(`   - ${p}`));
    
    // Show what will be removed
    const toRemove = currentPerms.filter(p => !CORRECT_SINH_VIEN_PERMISSIONS.includes(p));
    if (toRemove.length > 0) {
      console.log(`\n🗑️  Will REMOVE these incorrect permissions (${toRemove.length}):`);
      toRemove.forEach(p => console.log(`   ✗ ${p}`));
    }
    
    // Show what will be added
    const toAdd = CORRECT_SINH_VIEN_PERMISSIONS.filter(p => !currentPerms.includes(p));
    if (toAdd.length > 0) {
      console.log(`\n➕ Will ADD these missing permissions (${toAdd.length}):`);
      toAdd.forEach(p => console.log(`   ✓ ${p}`));
    }
    
    if (toRemove.length === 0 && toAdd.length === 0) {
      console.log('\n✅ Permissions are already correct! No changes needed.');
      return;
    }
    
    // Ask for confirmation
    console.log('\n' + '━'.repeat(60));
    console.log('⚠️  This will UPDATE the SINH_VIEN role permissions');
    console.log('Press Ctrl+C to cancel, or wait 5 seconds to continue...\n');
    
    await new Promise(resolve => setTimeout(resolve, 5000));
    
    // Update permissions
    console.log('🔄 Updating permissions...');
    
    const updated = await prisma.vai_tro.update({
      where: { id: sinhVienRole.id },
      data: {
        quyen_han: CORRECT_SINH_VIEN_PERMISSIONS
      }
    });
    
    console.log('\n✅ Successfully updated SINH_VIEN permissions!');
    console.log(`\n📋 New permissions (${CORRECT_SINH_VIEN_PERMISSIONS.length}):`);
    CORRECT_SINH_VIEN_PERMISSIONS.forEach(p => console.log(`   ✓ ${p}`));
    
    // Count affected users
    const userCount = await prisma.nguoi_dung.count({
      where: { vai_tro_id: sinhVienRole.id }
    });
    
    console.log(`\n👥 This affects ${userCount} student users`);
    console.log('\n' + '━'.repeat(60));
    console.log('✅ DONE! Student permissions have been corrected.');
    console.log('💡 Students will see changes immediately without needing to log out/in.');
    
  } catch (error) {
    console.error('\n❌ Error fixing student permissions:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run the script
fixStudentPermissions()
  .then(() => {
    console.log('\n✨ Script completed successfully!\n');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n💥 Script failed:', error);
    process.exit(1);
  });
