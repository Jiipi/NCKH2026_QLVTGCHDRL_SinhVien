#!/usr/bin/env node
// Inspect stored images for an activity by ID
const { PrismaClient } = require('@prisma/client');

async function main() {
  const id = process.argv[2];
  if (!id) {
    console.error('Usage: node scripts/inspect_activity_images.js <activityId>');
    process.exit(1);
  }
  const prisma = new PrismaClient();
  try {
    const hd = await prisma.hoatDong.findUnique({ where: { id } });
    if (!hd) {
      console.error('Activity not found:', id);
      process.exit(2);
    }
    console.log('Activity:', { id: hd.id, ten_hd: hd.ten_hd, trang_thai: hd.trang_thai });
    console.log('Stored hinh_anh:', hd.hinh_anh);
    console.log('Stored tep_dinh_kem:', hd.tep_dinh_kem);
    const cover = Array.isArray(hd.hinh_anh) && hd.hinh_anh.length > 0 ? hd.hinh_anh[0] : null;
    console.log('Cover (first image):', cover);
  } catch (e) {
    console.error('Error:', e?.message || e);
    process.exit(3);
  } finally {
    await prisma.$disconnect();
  }
}

main();
