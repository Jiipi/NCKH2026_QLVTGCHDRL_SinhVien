const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function run() {
  const CLASS_NAME = process.env.CLASS_NAME || 'ATTT01-2021';
  const SEMESTER = process.env.SEMESTER || 'hoc_ky_1';
  const YEAR = process.env.YEAR || '2025';

  try {
    const lop = await prisma.lop.findFirst({ where: { ten_lop: CLASS_NAME } });
    if (!lop) {
      console.log(JSON.stringify({ error: 'Class not found', class: CLASS_NAME }, null, 2));
      return;
    }

    const students = await prisma.sinhVien.findMany({
      where: { lop_id: lop.id },
      select: { nguoi_dung_id: true }
    });
    const creatorUserIds = students.map(s => s.nguoi_dung_id).filter(Boolean);
    if (lop.chu_nhiem) creatorUserIds.push(lop.chu_nhiem);

    const yearNum = parseInt(YEAR, 10);
    const yearLabel1 = `${yearNum}-${yearNum + 1}`;
    const yearLabel2 = `${yearNum} - ${yearNum + 1}`;

    const where = {
      hoc_ky: SEMESTER,
      OR: [
        { nam_hoc: yearLabel1 },
        { nam_hoc: yearLabel2 },
        { nam_hoc: { contains: YEAR } }
      ],
      nguoi_tao_id: { in: creatorUserIds }
    };

    // Breakdown counts by exact labels and contains-year only
    const exact1Count = await prisma.hoatDong.count({ where: { hoc_ky: SEMESTER, nam_hoc: yearLabel1, nguoi_tao_id: { in: creatorUserIds } } });
    const exact2Count = await prisma.hoatDong.count({ where: { hoc_ky: SEMESTER, nam_hoc: yearLabel2, nguoi_tao_id: { in: creatorUserIds } } });
    const containsYearCount = await prisma.hoatDong.count({ where: { hoc_ky: SEMESTER, nam_hoc: { contains: YEAR }, nguoi_tao_id: { in: creatorUserIds } } });
    const count = await prisma.hoatDong.count({ where });
    const recent = await prisma.hoatDong.findMany({
      where,
      select: { id: true, ten_hd: true, ngay_bd: true, nguoi_tao_id: true },
      orderBy: { ngay_bd: 'desc' },
      take: 5
    });

    console.log(JSON.stringify({
      class: CLASS_NAME,
      classId: lop.id,
      semester: SEMESTER,
      yearVariants: [yearLabel1, yearLabel2],
      totalCreators: creatorUserIds.length,
      activityCount: count,
      breakdown: {
        exactLabel1: exact1Count,
        exactLabel2: exact2Count,
        containsYear: containsYearCount
      },
      sampleRecent: recent
    }, null, 2));
  } catch (e) {
    console.error(e);
  } finally {
    await prisma.$disconnect();
  }
}

run();
