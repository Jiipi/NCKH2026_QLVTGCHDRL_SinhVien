const { prisma } = require('../src/config/database');

(async () => {
  try {
    const rows = await prisma.nguoiDung.findMany({ select: { ten_dn: true, email: true }, take: 20 });
    console.log(rows);
    const admin = await prisma.nguoiDung.findUnique({ where: { ten_dn: 'admin' } });
    console.log('admin email:', admin?.email);
    await prisma.$disconnect();
  } catch (e) {
    console.error('list_emails failed:', e);
    process.exit(1);
  }
})();
