const { prisma } = require('../src/infrastructure/prisma/client');

async function checkAllClasses() {
  const allClasses = await prisma.lop.findMany({
    select: { id: true, ten_lop: true, chu_nhiem: true },
    orderBy: { ten_lop: 'asc' }
  });

  console.log('Total classes:', allClasses.length);
  
  const gv001Classes = allClasses.filter(c => {
    // Get user for this chu_nhiem
    return true; // Will check manually
  });

  // Group by chu_nhiem
  const byChuNhiem = {};
  for (const c of allClasses) {
    if (!byChuNhiem[c.chu_nhiem]) {
      byChuNhiem[c.chu_nhiem] = [];
    }
    byChuNhiem[c.chu_nhiem].push(c.ten_lop);
  }

  console.log('\nClasses by chu_nhiem:');
  for (const [teacherId, classes] of Object.entries(byChuNhiem)) {
    if (classes.length > 2) {
      const user = await prisma.nguoiDung.findUnique({
        where: { id: teacherId },
        select: { ten_dn: true, ho_ten: true }
      });
      console.log(`\n${user?.ten_dn || teacherId} (${user?.ho_ten}): ${classes.length} classes`);
      console.log(classes.join(', '));
    }
  }
}

checkAllClasses()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
