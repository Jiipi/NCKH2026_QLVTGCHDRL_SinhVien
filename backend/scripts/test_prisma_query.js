const { prisma } = require('../src/infrastructure/prisma/client');

async function testQuery() {
  const teacherId = '6b73fdb1-135f-40f1-b9e2-9d24ef5e49ce';
  
  console.log('Testing Prisma query: prisma.lop.findMany({ where: { chu_nhiem: teacherId } })');
  console.log('teacherId:', teacherId);
  
  const result = await prisma.lop.findMany({
    where: { chu_nhiem: teacherId },
    select: { id: true, ten_lop: true, chu_nhiem: true }
  });
  
  console.log('\nResult count:', result.length);
  console.log('Classes:', result.map(r => r.ten_lop));
  
  // Also test without where clause
  console.log('\n--- Testing WITHOUT where clause ---');
  const allClasses = await prisma.lop.findMany({
    select: { id: true, ten_lop: true, chu_nhiem: true }
  });
  console.log('Total classes in DB:', allClasses.length);
}

testQuery()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
