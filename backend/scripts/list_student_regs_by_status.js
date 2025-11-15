#!/usr/bin/env node
const { prisma } = require('../src/infrastructure/prisma/client');

async function main() {
  const mssv = process.argv[2] || '202101002';
  const sv = await prisma.sinhVien.findFirst({ where: { mssv }, select: { id: true } });
  const regs = await prisma.dangKyHoatDong.findMany({
    where: { sv_id: sv.id },
    select: { trang_thai_dk: true, hoat_dong: { select: { id: true, ten_hd: true, diem_rl: true, hoc_ky: true, nam_hoc: true } } }
  });
  const byStatus = regs.reduce((acc, r)=>{ const k=r.trang_thai_dk; acc[k]=acc[k]||[]; acc[k].push(r); return acc; },{});
  Object.keys(byStatus).forEach(k=>{
    console.log('Status', k, 'count', byStatus[k].length, 'total', byStatus[k].reduce((s,r)=>s+Number(r.hoat_dong?.diem_rl||0),0));
  });
  await prisma.$disconnect();
}

main().catch(async (e)=>{ console.error(e); await prisma.$disconnect(); process.exit(1); });
