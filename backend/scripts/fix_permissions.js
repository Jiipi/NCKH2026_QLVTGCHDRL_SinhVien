const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    console.log('🔧 STARTING PERMISSION FIX...');

    // 1. Fix LOP_TRUONG
    console.log('1. Updating LOP_TRUONG permissions...');
    const monitorRole = await prisma.vaiTro.findUnique({ where: { ten_vt: 'LOP_TRUONG' } });

    if (monitorRole) {
        let permissions = monitorRole.quyen_han || [];
        // Normalize
        if (typeof permissions === 'string') {
            try { permissions = JSON.parse(permissions); } catch (e) { permissions = []; }
        }

        if (!permissions.includes('notifications.write')) {
            permissions.push('notifications.write');
            // Also add notifications.read if missing, as they need to see history
            if (!permissions.includes('notifications.read')) permissions.push('notifications.read');

            await prisma.vaiTro.update({
                where: { id: monitorRole.id },
                data: { quyen_han: permissions }
            });
            console.log('   ✓ Added notifications.write and notifications.read to LOP_TRUONG');
        } else {
            console.log('   ✓ LOP_TRUONG already has notifications.write');
        }
    } else {
        console.log('   ❌ Role LOP_TRUONG not found');
    }

    // 2. Fix GIANG_VIEN
    console.log('2. Updating GIANG_VIEN permissions...');
    const teacherRole = await prisma.vaiTro.findUnique({ where: { ten_vt: 'GIANG_VIEN' } });

    if (teacherRole) {
        let permissions = teacherRole.quyen_han || [];
        // Normalize
        if (typeof permissions === 'string') {
            try { permissions = JSON.parse(permissions); } catch (e) { permissions = []; }
        }

        let changed = false;
        if (!permissions.includes('notifications.write')) {
            permissions.push('notifications.write');
            changed = true;
        }
        if (!permissions.includes('notifications.read')) {
            permissions.push('notifications.read');
            changed = true;
        }

        if (changed) {
            await prisma.vaiTro.update({
                where: { id: teacherRole.id },
                data: { quyen_han: permissions }
            });
            console.log('   ✓ Added notifications.write/read to GIANG_VIEN');
        } else {
            console.log('   ✓ GIANG_VIEN already has permissions');
        }
    } else {
        console.log('   ❌ Role GIANG_VIEN not found');
    }

    console.log('✅ FIX COMPLETED');
}

main()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect());
