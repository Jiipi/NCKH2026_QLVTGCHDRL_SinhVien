const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    const userId = '2de13832-342f-4a60-9996-04fe512d2549'; // ID from frontend

    console.log(`Checking permissions for user: ${userId}`);

    const user = await prisma.nguoiDung.findUnique({
        where: { id: userId },
        include: {
            vai_tro: true
        }
    });

    if (!user) {
        console.log('User not found!');
        return;
    }

    console.log('User found:', user.ten_dn);
    console.log('Role:', user.vai_tro?.ten_vt);
    console.log('Raw Permissions:', user.vai_tro?.quyen_han);

    let permissions = user.vai_tro?.quyen_han || [];

    // Normalize permissions logic from dynamicPermission.js
    if (typeof permissions === 'string') {
        try {
            permissions = JSON.parse(permissions);
        } catch (e) {
            permissions = [];
        }
    } else if (typeof permissions === 'object' && !Array.isArray(permissions) && permissions !== null) {
        if (Array.isArray(permissions.permissions)) {
            permissions = permissions.permissions;
        } else {
            permissions = Object.values(permissions).filter(p => typeof p === 'string');
        }
    }

    console.log('Normalized Permissions:', permissions);

    const requiredPermission = 'notifications.write';
    let hasPermission = permissions.includes(requiredPermission);

    console.log(`Checking required permission: ${requiredPermission}`);
    console.log(`Direct match: ${hasPermission}`);

    if (!hasPermission && requiredPermission === 'notifications.write') {
        const hasSingular = permissions.includes('notification.write');
        console.log(`Checking singular 'notification.write': ${hasSingular}`);
        if (hasSingular) hasPermission = true;
    }

    console.log(`Final Result: ${hasPermission ? 'PASS' : 'FAIL'}`);
}

main()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect());
