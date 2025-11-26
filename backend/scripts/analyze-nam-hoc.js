const { prisma } = require('../src/data/infrastructure/prisma/client');

async function main() {
  console.log('═══════════════════════════════════════════════════════════════');
  console.log('📊 PHÂN TÍCH NĂM HỌC VÀ HỌC KỲ TRONG DB');
  console.log('═══════════════════════════════════════════════════════════════\n');

  // 1. Các giá trị năm học
  const namHocStats = await prisma.hoatDong.groupBy({
    by: ['nam_hoc'],
    _count: true,
    orderBy: { nam_hoc: 'asc' }
  });

  console.log('📅 Các giá trị nam_hoc trong DB:');
  namHocStats.forEach(x => {
    console.log(`   "${x.nam_hoc}": ${x._count} hoạt động`);
  });

  // 2. Các giá trị học kỳ
  const hocKyStats = await prisma.hoatDong.groupBy({
    by: ['hoc_ky'],
    _count: true
  });

  console.log('\n📅 Các giá trị hoc_ky trong DB:');
  hocKyStats.forEach(x => {
    console.log(`   "${x.hoc_ky}": ${x._count} hoạt động`);
  });

  // 3. Kết hợp
  const combined = await prisma.hoatDong.groupBy({
    by: ['nam_hoc', 'hoc_ky'],
    _count: true,
    orderBy: [{ nam_hoc: 'asc' }, { hoc_ky: 'asc' }]
  });

  console.log('\n📅 Kết hợp nam_hoc + hoc_ky:');
  combined.forEach(x => {
    console.log(`   "${x.nam_hoc}" + "${x.hoc_ky}": ${x._count} hoạt động`);
  });

  // 4. Kiểm tra trạng thái
  const statusStats = await prisma.hoatDong.groupBy({
    by: ['trang_thai'],
    _count: true
  });

  console.log('\n📊 Trạng thái hoạt động:');
  statusStats.forEach(x => {
    console.log(`   "${x.trang_thai}": ${x._count} hoạt động`);
  });
}

main()
  .catch(err => console.error('❌ Lỗi:', err))
  .finally(() => prisma.$disconnect());
