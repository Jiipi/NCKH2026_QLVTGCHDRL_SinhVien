#!/usr/bin/env node
// Quick script: debug semester writability check for a registration ID
const SemesterClosure = require('../src/services/semesterClosure.service');
const { prisma } = require('../src/config/database');

async function main() {
  const regId = process.argv[2];
  if (!regId) {
    console.error('Usage: node scripts/debug_semester_check.js <registrationId>');
    process.exit(1);
  }
  const reg = await prisma.dangKyHoatDong.findUnique({
    where: { id: regId },
    include: {
      sinh_vien: { include: { lop: true } },
      hoat_dong: { select: { hoc_ky: true, nam_hoc: true, ten_hd: true } }
    }
  });
  if (!reg) {
    console.error('Registration not found');
    process.exit(2);
  }
  const classId = reg.sinh_vien?.lop?.id;
  const hoc_ky = reg.hoat_dong?.hoc_ky;
  const nam_hoc = reg.hoat_dong?.nam_hoc;
  console.log('Input:', { classId, hoc_ky, nam_hoc, ten_hd: reg.hoat_dong?.ten_hd });
  try {
    SemesterClosure.checkWritableForClassSemesterOrThrow({ classId, hoc_ky, nam_hoc, userRole: 'TEACHER' });
    console.log('Decision: ALLOW (writable)');
  } catch (e) {
    console.log('Decision: BLOCK', { status: e.status, message: e.message, details: e.details });
  } finally {
    await prisma.$disconnect();
  }
}

main().catch(async (e) => {
  console.error(e);
  await prisma.$disconnect();
  process.exit(3);
});
