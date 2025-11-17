const { prisma } = require('../src/infrastructure/prisma/client');

async function main() {
  const username = process.argv[2] || 'gv001';
  const user = await prisma.nguoiDung.findFirst({
    where: { ten_dn: String(username) },
    select: { id: true, ten_dn: true, ho_ten: true }
  });
  if (!user) {
    console.log('User not found:', username);
    return;
  }

  const classes = await prisma.lop.findMany({
    where: { chu_nhiem: user.id },
    select: { id: true, ten_lop: true },
    orderBy: { ten_lop: 'asc' }
  });

  console.log({
    teacher: { id: user.id, ten_dn: user.ten_dn, ho_ten: user.ho_ten },
    homeroomCount: classes.length,
    classes
  });
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); });
