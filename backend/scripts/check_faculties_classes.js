const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  try {
    // Get distinct faculties
    const faculties = await prisma.lop.findMany({
      distinct: ['khoa'],
      select: { khoa: true },
      orderBy: { khoa: 'asc' }
    });

    console.log('=== FACULTIES (Khoa) ===');
    console.log(`Total: ${faculties.length}`);
    faculties.forEach((f, i) => {
      console.log(`${i + 1}. ${f.khoa || '(null)'}`);
    });

    // Get all classes
    const classes = await prisma.lop.findMany({
      select: { id: true, ten_lop: true, khoa: true, nien_khoa: true },
      orderBy: [{ khoa: 'asc' }, { ten_lop: 'asc' }]
    });

    console.log('\n=== CLASSES (Lop) ===');
    console.log(`Total: ${classes.length}`);
    
    // Group by faculty
    const byFaculty = {};
    classes.forEach(c => {
      const key = c.khoa || '(no faculty)';
      if (!byFaculty[key]) byFaculty[key] = [];
      byFaculty[key].push(c);
    });

    Object.entries(byFaculty).forEach(([faculty, lops]) => {
      console.log(`\n${faculty} (${lops.length} classes):`);
      lops.slice(0, 3).forEach(l => {
        console.log(`  - ${l.ten_lop} (${l.nien_khoa})`);
      });
      if (lops.length > 3) {
        console.log(`  ... and ${lops.length - 3} more`);
      }
    });

    // Check for empty khoa
    const emptyKhoa = classes.filter(c => !c.khoa);
    if (emptyKhoa.length > 0) {
      console.log(`\n⚠️  WARNING: ${emptyKhoa.length} classes have null/empty khoa`);
    }

  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

main();
