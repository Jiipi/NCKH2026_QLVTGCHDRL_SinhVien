/**
 * Script kiểm tra chi tiết hoạt động lớp ATTT01-2021
 */

const { prisma } = require('../src/data/infrastructure/prisma/client');

async function main() {
  console.log('═══════════════════════════════════════════════════════════════');
  console.log('🔍 KIỂM TRA CHI TIẾT HOẠT ĐỘNG LỚP ATTT01-2021');
  console.log('═══════════════════════════════════════════════════════════════\n');

  // 1. Tìm lớp
  const lop = await prisma.lop.findFirst({
    where: { ten_lop: { contains: 'ATTT01-2021' } },
    include: { chu_nhiem_rel: true }
  });

  console.log('📋 Lớp:', lop.ten_lop);
  console.log('   ID:', lop.id);
  console.log('   GVCN:', lop.chu_nhiem_rel?.ho_ten);
  console.log('   GVCN ID:', lop.chu_nhiem);

  // 2. Xem các năm học và học kỳ có trong hoạt động của lớp này
  const stats = await prisma.hoatDong.groupBy({
    by: ['nam_hoc', 'hoc_ky', 'trang_thai'],
    where: { lop_id: lop.id },
    _count: true
  });

  console.log('\n📊 Phân bố hoạt động theo năm học/học kỳ/trạng thái:');
  stats.forEach(s => {
    console.log(`   ${s.nam_hoc} | ${s.hoc_ky} | ${s.trang_thai}: ${s._count}`);
  });

  // 3. Query theo các học kỳ khác nhau
  const allLopActivities = await prisma.hoatDong.findMany({
    where: { lop_id: lop.id },
    select: {
      id: true,
      ten_hd: true,
      nam_hoc: true,
      hoc_ky: true,
      trang_thai: true
    }
  });

  console.log(`\n📊 Tổng hoạt động của lớp (tất cả trạng thái): ${allLopActivities.length}`);

  // 4. Tìm hoạt động đã duyệt
  const approvedActivities = allLopActivities.filter(a => 
    a.trang_thai === 'da_duyet' || a.trang_thai === 'ket_thuc'
  );

  console.log(`📊 Hoạt động đã duyệt/kết thúc: ${approvedActivities.length}`);

  // Group by nam_hoc + hoc_ky
  const grouped = {};
  approvedActivities.forEach(a => {
    const key = `${a.nam_hoc}_${a.hoc_ky}`;
    if (!grouped[key]) grouped[key] = [];
    grouped[key].push(a);
  });

  console.log('\n📊 Chi tiết theo năm học/học kỳ (đã duyệt):');
  Object.keys(grouped).sort().forEach(key => {
    console.log(`   ${key}: ${grouped[key].length} hoạt động`);
  });

  // 5. Kiểm tra xem có hoạt động nào với nam_hoc 2024-2025 không
  const hk1_2025 = approvedActivities.filter(a => 
    a.nam_hoc === '2024-2025' && a.hoc_ky === 'hoc_ky_1'
  );
  
  console.log(`\n📊 HK1 2024-2025 (đã duyệt): ${hk1_2025.length}`);

  // 6. Kiểm tra năm học 2025-2026
  const hk1_2025_2026 = approvedActivities.filter(a => 
    a.nam_hoc === '2025-2026' && a.hoc_ky === 'hoc_ky_1'
  );
  
  console.log(`📊 HK1 2025-2026 (đã duyệt): ${hk1_2025_2026.length}`);

  // 7. Liệt kê 5 hoạt động mới nhất
  console.log('\n📋 5 hoạt động đã duyệt gần đây của lớp:');
  approvedActivities.slice(0, 5).forEach((a, i) => {
    console.log(`   ${i+1}. ${a.ten_hd} | ${a.nam_hoc} | ${a.hoc_ky} | ${a.trang_thai}`);
  });
}

main()
  .catch(err => console.error('❌ Lỗi:', err.message))
  .finally(() => prisma.$disconnect());
