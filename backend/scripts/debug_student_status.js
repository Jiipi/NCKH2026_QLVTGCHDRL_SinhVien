#!/usr/bin/env node
const { prisma } = require('../src/infrastructure/prisma/client');
const { buildRobustActivitySemesterWhere } = require('../src/core/utils/semester');

async function main() {
  const [mssv, semesterArg] = process.argv.slice(2);
  if (!mssv || !semesterArg) {
    console.log('Usage: node backend/scripts/debug_student_status.js <MSSV> <semesterString>');
    process.exit(1);
  }
  const sv = await prisma.sinhVien.findFirst({ where: { mssv }, select: { id: true } });
  if (!sv) { console.error('Student not found'); process.exit(1); }
  
  const activityFilter = buildRobustActivitySemesterWhere(semesterArg);
  const regs = await prisma.dangKyHoatDong.findMany({
    where: { sv_id: sv.id, hoat_dong: activityFilter },
    select: {
      id: true,
      trang_thai_dk: true,
      hoat_dong: { select: { id: true, ten_hd: true, diem_rl: true, hoc_ky: true, nam_hoc: true } }
    },
    orderBy: { ngay_dang_ky: 'asc' }
  });
  
  const byStatus = {};
  regs.forEach(r => {
    const st = r.trang_thai_dk;
    if (!byStatus[st]) byStatus[st] = { count: 0, total: 0, items: [] };
    byStatus[st].count++;
    byStatus[st].total += Number(r.hoat_dong.diem_rl || 0);
    byStatus[st].items.push({ id: r.hoat_dong.id, ten_hd: r.hoat_dong.ten_hd, diem: Number(r.hoat_dong.diem_rl) });
  });
  
  console.log('Registrations by status for', mssv, 'in', semesterArg);
  Object.keys(byStatus).forEach(st => {
    console.log(`\n${st}: count=${byStatus[st].count}, total=${byStatus[st].total}`);
    byStatus[st].items.forEach(item => console.log(`  - ${item.id.slice(0,8)}: ${item.diem}đ ${item.ten_hd}`));
  });
  
  await prisma.$disconnect();
}

main().catch(async (e) => { console.error(e); await prisma.$disconnect(); process.exit(1); });
