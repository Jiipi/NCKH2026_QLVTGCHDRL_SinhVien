#!/usr/bin/env node
const { prisma } = require('../src/infrastructure/prisma/client');

async function main() {
  const mssv = process.argv[2] || '202101002';
  const sv = await prisma.sinhVien.findFirst({ where: { mssv }, select: { id: true } });
  if (!sv) { console.error('Student not found'); process.exit(1); }
  const regs = await prisma.dangKyHoatDong.findMany({
    where: { sv_id: sv.id, trang_thai_dk: 'da_tham_gia' },
    select: { hoat_dong: { select: { id: true, diem_rl: true, hoc_ky: true, nam_hoc: true } } }
  });
  const total = regs.reduce((s, r) => s + Number(r.hoat_dong?.diem_rl || 0), 0);
  console.log({ count: regs.length, total });
  await prisma.$disconnect();
}

main().catch(async (e)=>{ console.error(e); await prisma.$disconnect(); process.exit(1); });
