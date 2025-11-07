const { prisma } = require('../src/config/database');

(async () => {
  try {
    const users = await prisma.nguoiDung.findMany({
      select: { ten_dn: true, email: true, ho_ten: true },
      take: 30,
      orderBy: { ngay_tao: 'desc' }
    });
    console.log(JSON.stringify(users, null, 2));
    await prisma.$disconnect();
  } catch (e) {
    console.error('Error:', e.message);
    process.exit(1);
  }
})();
