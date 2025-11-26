const { prisma } = require('../src/data/infrastructure/prisma/client');

async function main() {
  const total = await prisma.hoatDong.count();
  const hasLopId = await prisma.hoatDong.count({ where: { lop_id: { not: null } } });
  
  console.log('📊 Thống kê hoạt động:');
  console.log(`   Tổng: ${total}`);
  console.log(`   Có lop_id: ${hasLopId}`);
  console.log(`   Không có lop_id: ${total - hasLopId}`);
}

main().finally(() => prisma.$disconnect());
