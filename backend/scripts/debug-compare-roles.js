/**
 * Script kiểm tra sự khác biệt giữa Admin và GV/SV/LT
 * Lớp ATTT01-2021, HK1 2025
 */

const { prisma } = require('../src/data/infrastructure/prisma/client');

async function main() {
  console.log('═══════════════════════════════════════════════════════════════');
  console.log('🔍 SO SÁNH QUERY GIỮA CÁC ROLE - ATTT01-2021 HK1 2025');
  console.log('═══════════════════════════════════════════════════════════════\n');

  // 1. Tìm lớp
  const lop = await prisma.lop.findFirst({
    where: { ten_lop: 'ATTT01-2021' },
    include: { chu_nhiem_rel: true }
  });

  console.log('📋 Lớp:', lop.ten_lop, '| GVCN:', lop.chu_nhiem_rel?.ho_ten);

  // 2. Query theo lop_id (GV/SV/LT logic)
  const byLopId = await prisma.hoatDong.findMany({
    where: {
      lop_id: lop.id,
      hoc_ky: 'hoc_ky_1',
      nam_hoc: '2025',
      trang_thai: { in: ['da_duyet', 'ket_thuc'] }
    },
    select: { id: true, ten_hd: true, nguoi_tao_id: true, lop_id: true }
  });

  console.log(`\n📊 Query 1 - Theo lop_id = '${lop.id}':`);
  console.log(`   Kết quả: ${byLopId.length} hoạt động`);

  // 3. Query theo nguoi_tao_id (có thể Admin đang dùng)
  const byCreator = await prisma.hoatDong.findMany({
    where: {
      nguoi_tao_id: lop.chu_nhiem,
      hoc_ky: 'hoc_ky_1',
      nam_hoc: '2025',
      trang_thai: { in: ['da_duyet', 'ket_thuc'] }
    },
    select: { id: true, ten_hd: true, nguoi_tao_id: true, lop_id: true }
  });

  console.log(`\n📊 Query 2 - Theo nguoi_tao_id = '${lop.chu_nhiem}':`);
  console.log(`   Kết quả: ${byCreator.length} hoạt động`);

  // 4. Tìm sự khác biệt
  const lopIdSet = new Set(byLopId.map(a => a.id));
  const creatorSet = new Set(byCreator.map(a => a.id));

  const onlyInLopId = byLopId.filter(a => !creatorSet.has(a.id));
  const onlyInCreator = byCreator.filter(a => !lopIdSet.has(a.id));

  console.log('\n═══════════════════════════════════════════════════════════════');
  console.log('🔍 SỰ KHÁC BIỆT:');
  console.log('═══════════════════════════════════════════════════════════════');
  console.log(`   Chỉ có trong Query 1 (lop_id): ${onlyInLopId.length}`);
  console.log(`   Chỉ có trong Query 2 (nguoi_tao): ${onlyInCreator.length}`);

  if (onlyInLopId.length > 0) {
    console.log('\n⚠️  Hoạt động có lop_id nhưng KHÔNG do GVCN tạo:');
    for (const a of onlyInLopId) {
      const creator = await prisma.nguoiDung.findUnique({
        where: { id: a.nguoi_tao_id },
        select: { ho_ten: true }
      });
      console.log(`   - ${a.ten_hd}`);
      console.log(`     Người tạo: ${creator?.ho_ten} (${a.nguoi_tao_id})`);
    }
  }

  if (onlyInCreator.length > 0) {
    console.log('\n⚠️  Hoạt động do GVCN tạo nhưng lop_id khác:');
    for (const a of onlyInCreator) {
      let lopName = 'NULL';
      if (a.lop_id) {
        const otherLop = await prisma.lop.findUnique({
          where: { id: a.lop_id },
          select: { ten_lop: true }
        });
        lopName = otherLop?.ten_lop || a.lop_id;
      }
      console.log(`   - ${a.ten_hd}`);
      console.log(`     lop_id: ${lopName}`);
    }
  }

  // 5. Kết luận
  console.log('\n═══════════════════════════════════════════════════════════════');
  console.log('📌 KẾT LUẬN:');
  console.log('═══════════════════════════════════════════════════════════════');
  
  if (byLopId.length === 20 && byCreator.length === 21) {
    console.log('✅ GV/SV/LT thấy 20 (query theo lop_id)');
    console.log('⚠️  Admin thấy 21 (có thể query theo nguoi_tao_id)');
    console.log('\n🔧 Nguyên nhân: 1 hoạt động do GVCN tạo nhưng lop_id không đúng');
  } else if (byLopId.length !== byCreator.length) {
    console.log(`GV/SV/LT: ${byLopId.length} | Admin có thể thấy: ${byCreator.length}`);
    console.log(`Chênh lệch: ${Math.abs(byLopId.length - byCreator.length)}`);
  } else {
    console.log('✅ Số lượng khớp nhau');
  }
}

main()
  .catch(err => console.error('❌ Lỗi:', err.message))
  .finally(() => prisma.$disconnect());
