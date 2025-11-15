#!/usr/bin/env node
const { prisma } = require('../src/infrastructure/prisma/client');
const { buildRobustActivitySemesterWhere, parseSemesterString } = require('../src/core/utils/semester');

async function main() {
  const [mssv, semesterArg] = process.argv.slice(2);
  if (!mssv || !semesterArg) {
    console.log('Usage: node backend/scripts/sum_student_points.js <MSSV> <semesterString>');
    console.log('Example: node backend/scripts/sum_student_points.js 202101002 hoc_ky_1-2025');
    process.exit(1);
  }
  const sem = parseSemesterString(semesterArg);
  if (!sem) {
    console.error('Invalid semester string');
    process.exit(1);
  }
  const sv = await prisma.sinhVien.findFirst({ where: { mssv }, select: { id: true, mssv: true } });
  if (!sv) {
    console.error('Student not found');
    process.exit(1);
  }
  const activityFilter = buildRobustActivitySemesterWhere(semesterArg);
  const regs = await prisma.dangKyHoatDong.findMany({
    where: { sv_id: sv.id, trang_thai_dk: 'da_tham_gia', hoat_dong: activityFilter },
    select: { hoat_dong: { select: { id: true, ten_hd: true, diem_rl: true, hoc_ky: true, nam_hoc: true, ngay_bd: true } } },
    orderBy: { ngay_dang_ky: 'asc' }
  });
  const total = regs.reduce((s, r) => s + Number(r.hoat_dong?.diem_rl || 0), 0);
  console.log({ mssv: sv.mssv, count: regs.length, total, activities: regs.map(r => ({ id: r.hoat_dong.id, diem: Number(r.hoat_dong.diem_rl), hk: r.hoat_dong.hoc_ky, nh: r.hoat_dong.nam_hoc })) });
  await prisma.$disconnect();
}

main().catch(async (e) => { console.error(e); await prisma.$disconnect(); process.exit(1); });
