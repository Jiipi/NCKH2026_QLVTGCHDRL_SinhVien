/**
 * Script chuẩn hóa nam_hoc trong bảng hoat_dong
 * Chuyển tất cả về format năm đơn: 2024, 2025, 2026...
 * 
 * Logic:
 * - "2024-2025" -> "2024" (lấy năm đầu)
 * - "2025-2026" -> "2025"
 * - "2024" -> giữ nguyên
 */

const { prisma } = require('../src/data/infrastructure/prisma/client');

async function main() {
  console.log('═══════════════════════════════════════════════════════════════');
  console.log('🔧 CHUẨN HÓA NAM_HOC TRONG HOAT_DONG');
  console.log('═══════════════════════════════════════════════════════════════\n');

  // 1. Phân tích dữ liệu hiện tại
  const stats = await prisma.hoatDong.groupBy({
    by: ['nam_hoc'],
    _count: true
  });

  console.log('📊 Dữ liệu TRƯỚC khi chuẩn hóa:');
  stats.forEach(s => {
    console.log(`   "${s.nam_hoc}": ${s._count} hoạt động`);
  });

  // 2. Tìm các bản ghi cần cập nhật (có dạng YYYY-YYYY)
  const toUpdate = await prisma.hoatDong.findMany({
    where: {
      nam_hoc: { contains: '-' }
    },
    select: { id: true, nam_hoc: true }
  });

  console.log(`\n📋 Số bản ghi cần cập nhật: ${toUpdate.length}`);

  if (toUpdate.length === 0) {
    console.log('✅ Không có bản ghi nào cần cập nhật');
    return;
  }

  // 3. Cập nhật từng bản ghi
  let updated = 0;
  for (const record of toUpdate) {
    // Extract year đầu tiên từ "2024-2025" -> "2024"
    const match = record.nam_hoc.match(/^(\d{4})/);
    if (!match) {
      console.log(`   ⚠️ Không thể parse: "${record.nam_hoc}" (ID: ${record.id})`);
      continue;
    }

    const newNamHoc = match[1];
    
    await prisma.hoatDong.update({
      where: { id: record.id },
      data: { nam_hoc: newNamHoc }
    });

    updated++;
    if (updated % 50 === 0) {
      console.log(`   Đã cập nhật ${updated}/${toUpdate.length}...`);
    }
  }

  console.log(`\n✅ Đã cập nhật: ${updated} bản ghi`);

  // 4. Kiểm tra kết quả
  const statsAfter = await prisma.hoatDong.groupBy({
    by: ['nam_hoc'],
    _count: true,
    orderBy: { nam_hoc: 'asc' }
  });

  console.log('\n📊 Dữ liệu SAU khi chuẩn hóa:');
  statsAfter.forEach(s => {
    console.log(`   "${s.nam_hoc}": ${s._count} hoạt động`);
  });

  console.log('\n═══════════════════════════════════════════════════════════════');
  console.log('✅ HOÀN TẤT CHUẨN HÓA NAM_HOC');
  console.log('═══════════════════════════════════════════════════════════════');
}

main()
  .catch(err => console.error('❌ Lỗi:', err))
  .finally(() => prisma.$disconnect());
