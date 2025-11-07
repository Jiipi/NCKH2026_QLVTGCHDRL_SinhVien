// Quick Prisma smoke test to update and read back hinh_anh
const { PrismaClient } = require('@prisma/client');

(async () => {
  const p = new PrismaClient();
  try {
    const id = process.env.ACTIVITY_ID || '152e568b-e4d7-47d7-9856-5e068cffb108';
    const url = process.env.IMAGE_URL || '/uploads/images/ngay_xanh-1762173680419-157629507.jpg';
    const u = await p.hoatDong.update({ where: { id }, data: { hinh_anh: [url] } });
    console.log('Updated:', u.hinh_anh);
    const r = await p.hoatDong.findUnique({ where: { id } });
    console.log('Readback:', r?.hinh_anh);
  } catch (e) {
    console.error('Smoke error:', e?.message || e);
    process.exitCode = 1;
  } finally {
    await p.$disconnect();
  }
})();
