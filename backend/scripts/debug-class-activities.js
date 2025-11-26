/**
 * Script kiểm tra số hoạt động đã duyệt của lớp ATTT01-2021 trong HK1 2025
 * So sánh logic giữa các role: Admin, GV, SV, Lớp trưởng
 */

const { prisma } = require('../src/data/infrastructure/prisma/client');

async function main() {
  console.log('═══════════════════════════════════════════════════════════════');
  console.log('🔍 KIỂM TRA HOẠT ĐỘNG LỚP ATTT01-2021 - HK1 2025');
  console.log('═══════════════════════════════════════════════════════════════\n');

  // 1. Tìm lớp ATTT01-2021
  const lop = await prisma.lop.findFirst({
    where: {
      OR: [
        { ten_lop: { contains: 'ATTT01-2021' } },
        { ten_lop: { contains: 'ATTT01' } }
      ]
    },
    include: {
      chu_nhiem_rel: true
    }
  });

  if (!lop) {
    console.log('❌ Không tìm thấy lớp ATTT01-2021');
    return;
  }

  console.log('📋 Thông tin lớp:');
  console.log(`   ID: ${lop.id}`);
  console.log(`   Tên: ${lop.ten_lop}`);
  console.log(`   GVCN: ${lop.chu_nhiem_rel?.ho_ten || 'Chưa có'}`);
  console.log(`   GVCN ID: ${lop.chu_nhiem || 'N/A'}`);

  // 2. Query 1: Hoạt động có lop_id = lớp này + trạng thái đã duyệt + HK1 2025
  const activitiesByLopId = await prisma.hoatDong.findMany({
    where: {
      lop_id: lop.id,
      hoc_ky: 'hoc_ky_1',
      nam_hoc: '2024-2025',
      trang_thai: { in: ['da_duyet', 'ket_thuc'] }
    },
    select: {
      id: true,
      ten_hd: true,
      trang_thai: true,
      nguoi_tao_id: true,
      lop_id: true,
      hoc_ky: true,
      nam_hoc: true
    }
  });

  console.log(`\n📊 Query 1 - Theo lop_id (dùng cho GV/SV/LT):`);
  console.log(`   Số hoạt động: ${activitiesByLopId.length}`);

  // 3. Query 2: Hoạt động do GVCN tạo + trạng thái đã duyệt + HK1 2025 (có thể Admin dùng logic khác)
  const activitiesByCreator = await prisma.hoatDong.findMany({
    where: {
      nguoi_tao_id: lop.chu_nhiem,
      hoc_ky: 'hoc_ky_1',
      nam_hoc: '2024-2025',
      trang_thai: { in: ['da_duyet', 'ket_thuc'] }
    },
    select: {
      id: true,
      ten_hd: true,
      trang_thai: true,
      nguoi_tao_id: true,
      lop_id: true,
      hoc_ky: true,
      nam_hoc: true
    }
  });

  console.log(`\n📊 Query 2 - Theo nguoi_tao_id (GVCN tạo):`);
  console.log(`   Số hoạt động: ${activitiesByCreator.length}`);

  // 4. Tìm sự khác biệt
  const lopIdSet = new Set(activitiesByLopId.map(a => a.id));
  const creatorSet = new Set(activitiesByCreator.map(a => a.id));

  const onlyInLopId = activitiesByLopId.filter(a => !creatorSet.has(a.id));
  const onlyInCreator = activitiesByCreator.filter(a => !lopIdSet.has(a.id));

  console.log(`\n🔍 Sự khác biệt:`);
  console.log(`   Chỉ có trong Query 1 (lop_id): ${onlyInLopId.length}`);
  console.log(`   Chỉ có trong Query 2 (nguoi_tao): ${onlyInCreator.length}`);

  if (onlyInCreator.length > 0) {
    console.log(`\n⚠️  Hoạt động có trong Query 2 nhưng KHÔNG có trong Query 1:`);
    for (const a of onlyInCreator) {
      console.log(`   - ID: ${a.id}`);
      console.log(`     Tên: ${a.ten_hd}`);
      console.log(`     lop_id: ${a.lop_id || 'NULL'}`);
      console.log(`     Trạng thái: ${a.trang_thai}`);
      console.log('');
    }
  }

  // 5. Kiểm tra tất cả hoạt động của GVCN (không filter học kỳ)
  const allGVActivities = await prisma.hoatDong.findMany({
    where: {
      nguoi_tao_id: lop.chu_nhiem,
      trang_thai: { in: ['da_duyet', 'ket_thuc'] }
    },
    select: {
      id: true,
      ten_hd: true,
      trang_thai: true,
      lop_id: true,
      hoc_ky: true,
      nam_hoc: true
    }
  });

  const missingLopId = allGVActivities.filter(a => a.lop_id !== lop.id);
  
  console.log(`\n📊 Tất cả hoạt động GVCN tạo (đã duyệt): ${allGVActivities.length}`);
  console.log(`   Có lop_id đúng: ${allGVActivities.length - missingLopId.length}`);
  console.log(`   lop_id khác/NULL: ${missingLopId.length}`);

  if (missingLopId.length > 0) {
    console.log(`\n⚠️  Hoạt động GVCN tạo nhưng lop_id không phải lớp này:`);
    for (const a of missingLopId.slice(0, 5)) {
      console.log(`   - ${a.ten_hd} | lop_id: ${a.lop_id || 'NULL'} | HK${a.hoc_ky} ${a.nam_hoc}`);
    }
    if (missingLopId.length > 5) {
      console.log(`   ... và ${missingLopId.length - 5} hoạt động khác`);
    }
  }

  // 6. Kiểm tra xem Admin đang dùng logic gì
  console.log('\n═══════════════════════════════════════════════════════════════');
  console.log('📌 KẾT LUẬN:');
  console.log('═══════════════════════════════════════════════════════════════');
  
  if (activitiesByLopId.length === 20 && activitiesByCreator.length === 21) {
    console.log('✅ GV/SV/LT dùng Query theo lop_id → 20 hoạt động');
    console.log('❓ Admin có thể dùng Query theo nguoi_tao_id → 21 hoạt động');
    console.log('\n🔧 Cần kiểm tra code Admin dashboard xem đang dùng logic nào');
  }
}

main()
  .catch(err => console.error('❌ Lỗi:', err.message))
  .finally(() => prisma.$disconnect());
