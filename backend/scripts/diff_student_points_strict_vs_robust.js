#!/usr/bin/env node
const { prisma } = require('../src/infrastructure/prisma/client');
const { buildRobustActivitySemesterWhere } = require('../src/core/utils/semester');

async function main() {
  const [mssv, semesterArg] = process.argv.slice(2);
  if (!mssv || !semesterArg) {
    console.log('Usage: node backend/scripts/diff_student_points_strict_vs_robust.js <MSSV> <semesterString>');
    process.exit(1);
  }
  const sv = await prisma.sinhVien.findFirst({ where: { mssv }, select: { id: true } });
  const strictRegs = await prisma.dangKyHoatDong.findMany({
    where: { sv_id: sv.id, trang_thai_dk: 'da_tham_gia', hoat_dong: { hoc_ky: 'hoc_ky_1', nam_hoc: '2025-2026' } },
    select: { hoat_dong: { select: { id: true, diem_rl: true, ngay_bd: true, hoc_ky: true, nam_hoc: true } } }
  });
  const robustWhere = buildRobustActivitySemesterWhere(semesterArg);
  const robustRegs = await prisma.dangKyHoatDong.findMany({
    where: { sv_id: sv.id, trang_thai_dk: 'da_tham_gia', hoat_dong: robustWhere },
    select: { hoat_dong: { select: { id: true, diem_rl: true, ngay_bd: true, hoc_ky: true, nam_hoc: true } } }
  });
  const strictIds = new Set(strictRegs.map(r => r.hoat_dong.id));
  const robustIds = new Set(robustRegs.map(r => r.hoat_dong.id));
  const onlyStrict = [...strictIds].filter(id => !robustIds.has(id));
  const onlyRobust = [...robustIds].filter(id => !strictIds.has(id));
  console.log({
    strictCount: strictRegs.length,
    robustCount: robustRegs.length,
    strictTotal: strictRegs.reduce((s, r) => s + Number(r.hoat_dong.diem_rl || 0), 0),
    robustTotal: robustRegs.reduce((s, r) => s + Number(r.hoat_dong.diem_rl || 0), 0),
    onlyStrict,
    onlyRobust
  });
  await prisma.$disconnect();
}

main().catch(async (e) => { console.error(e); await prisma.$disconnect(); process.exit(1); });
