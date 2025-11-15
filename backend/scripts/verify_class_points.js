#!/usr/bin/env node
/**
 * Verify and summarize rèn luyện points for a class in a semester
 * Usage:
 *   node backend/scripts/verify_class_points.js ATTT01-2021 hoc_ky_1-2025
 */
const { prisma } = require('../src/infrastructure/prisma/client');
const { parseSemesterString } = require('../src/core/utils/semester');

async function main() {
  const [classCodeOrId, semesterArg] = process.argv.slice(2);
  if (!classCodeOrId || !semesterArg) {
    console.log('Usage: node backend/scripts/verify_class_points.js <CLASS_CODE_OR_ID> <semesterString>');
    console.log('Example: node backend/scripts/verify_class_points.js ATTT01-2021 hoc_ky_1-2025');
    process.exit(1);
  }

  const sem = parseSemesterString(semesterArg);
  if (!sem) {
    console.error('Invalid semester string. Expect format like hoc_ky_1-2025');
    process.exit(1);
  }

  // Find class by id or code (ten_lop)
  let lop = null;
  if (/^[0-9a-fA-F-]{36}$/.test(classCodeOrId)) {
    lop = await prisma.lop.findUnique({ where: { id: classCodeOrId }, select: { id: true, ten_lop: true } });
  } else {
    lop = await prisma.lop.findFirst({ where: { ten_lop: classCodeOrId }, select: { id: true, ten_lop: true } });
  }
  if (!lop) {
    console.error('Class not found:', classCodeOrId);
    process.exit(1);
  }

  const students = await prisma.sinhVien.findMany({
    where: { lop_id: lop.id },
    select: { id: true, mssv: true, nguoi_dung: { select: { ho_ten: true } } }
  });

  // Get all participated registrations for the semester
  const regs = await prisma.dangKyHoatDong.findMany({
    where: {
      sinh_vien: { lop_id: lop.id },
      trang_thai_dk: 'da_tham_gia',
      hoat_dong: { hoc_ky: sem.semester, nam_hoc: { contains: sem.year } }
    },
    select: { sv_id: true, hoat_dong: { select: { diem_rl: true } } }
  });

  const sumBySv = new Map();
  const countBySv = new Map();
  for (const r of regs) {
    sumBySv.set(r.sv_id, Number(sumBySv.get(r.sv_id) || 0) + Number(r.hoat_dong?.diem_rl || 0));
    countBySv.set(r.sv_id, (countBySv.get(r.sv_id) || 0) + 1);
  }

  const rows = students.map(s => ({
    mssv: s.mssv,
    name: s.nguoi_dung?.ho_ten || 'N/A',
    activities: Number(countBySv.get(s.id) || 0),
    points: Number(sumBySv.get(s.id) || 0)
  }));

  const totalStudents = students.length;
  const participants = rows.filter(r => r.activities > 0).length;
  const totalPoints = rows.reduce((acc, r) => acc + r.points, 0);

  console.log(`Class: ${lop.ten_lop} (${lop.id}) | Semester: ${semesterArg}`);
  console.log(`Students: ${totalStudents} | Participants: ${participants}`);
  console.log(`Total RL points: ${totalPoints}`);
  console.log('--- Detail (first 20) ---');
  rows.slice(0, 20).forEach(r => console.log(`${r.mssv.padEnd(12)} | ${String(r.activities).padStart(2)} act | ${r.points} pts | ${r.name}`));

  // Uncomment below to print all
  // rows.forEach(r => console.log(`${r.mssv}\t${r.activities}\t${r.points}\t${r.name}`));

  await prisma.$disconnect();
}

main().catch(async (e) => {
  console.error(e);
  await prisma.$disconnect();
  process.exit(1);
});
