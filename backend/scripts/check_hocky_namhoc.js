/**
 * Script kiểm tra dữ liệu học kỳ trong DB
 */
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const rows = await prisma.hoatDong.findMany({
    select: { hoc_ky: true, nam_hoc: true },
    distinct: ['hoc_ky', 'nam_hoc'],
  });
  
  console.log('Distinct hoc_ky + nam_hoc:');
  console.log(JSON.stringify(rows, null, 2));
  
  // Count by nam_hoc
  const byYear = await prisma.hoatDong.groupBy({
    by: ['nam_hoc'],
    _count: { _all: true },
  });
  console.log('\nCount by nam_hoc:');
  byYear.forEach(r => console.log(`  ${r.nam_hoc}: ${r._count._all}`));
  
  // Count by hoc_ky
  const byHK = await prisma.hoatDong.groupBy({
    by: ['hoc_ky'],
    _count: { _all: true },
  });
  console.log('\nCount by hoc_ky:');
  byHK.forEach(r => console.log(`  ${r.hoc_ky}: ${r._count._all}`));
  
  await prisma.$disconnect();
}

main();
