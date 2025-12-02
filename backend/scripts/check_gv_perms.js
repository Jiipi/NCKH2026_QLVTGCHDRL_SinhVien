const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const user = await prisma.nguoiDung.findFirst({
    where: { ten_dn: 'gv0404' },
    include: { vai_tro: true }
  });
  
  console.log('User:', user?.ten_dn);
  console.log('Role:', user?.vai_tro?.ten_vt);
  console.log('Permissions:', JSON.stringify(user?.vai_tro?.quyen_han, null, 2));
  
  // Check for specific permission
  const perms = user?.vai_tro?.quyen_han?.permissions || [];
  console.log('\n--- Permission Check ---');
  console.log('Has notifications.write:', perms.includes('notifications.write'));
  console.log('Has notification.write:', perms.includes('notification.write'));
  console.log('Has notifications.read:', perms.includes('notifications.read'));
  console.log('Has notification.read:', perms.includes('notification.read'));
  
  await prisma.$disconnect();
}

main().catch(console.error);
