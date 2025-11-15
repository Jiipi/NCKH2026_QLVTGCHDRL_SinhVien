#!/usr/bin/env node
const { prisma } = require('../src/infrastructure/prisma/client');

async function main() {
  const mssv = process.argv[2] || '202101002';
  const sv = await prisma.sinhVien.findFirst({
    where: { mssv },
    select: {
      id: true,
      mssv: true,
      lop_id: true,
      lop: { select: { id: true, ten_lop: true } }
    }
  });
  console.log(sv || null);
  await prisma.$disconnect();
}

main().catch(async (e) => {
  console.error(e);
  await prisma.$disconnect();
  process.exit(1);
});
