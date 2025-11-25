const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    console.log('Searching for a user with LOP_TRUONG role...');

    const role = await prisma.vaiTro.findUnique({
        where: { ten_vt: 'LOP_TRUONG' }
    });

    if (!role) {
        console.log('Role LOP_TRUONG not found!');
        return;
    }

    console.log(`Role LOP_TRUONG found. ID: ${role.id}`);
    console.log(`Default Permissions: ${JSON.stringify(role.quyen_han)}`);

    const user = await prisma.nguoiDung.findFirst({
        where: { vai_tro_id: role.id },
        include: { vai_tro: true }
    });

    if (!user) {
        console.log('No user found with LOP_TRUONG role!');
        return;
    }

    console.log('User found:', user.ten_dn);
    console.log('User ID:', user.id);
    console.log('Role:', user.vai_tro?.ten_vt);

    let permissions = user.vai_tro?.quyen_han || [];

    // Normalize permissions logic
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
