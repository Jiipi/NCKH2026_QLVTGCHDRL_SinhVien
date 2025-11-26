/**
 * Tìm hoạt động đã duyệt nhưng thiếu lop_id
 */
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('\n🔍 TÌM HOẠT ĐỘNG ĐÃ DUYỆT NHƯNG THIẾU lop_id\n');

  // Tìm hoạt động da_duyet HK1 2025 nhưng KHÔNG có lop_id
  const orphan = await prisma.hoatDong.findMany({
    where: {
      hoc_ky: 'hoc_ky_1',
      nam_hoc: '2025',
      trang_thai: { in: ['da_duyet', 'ket_thuc'] },
      lop_id: null
    },
    select: {
      id: true,
      ten_hd: true,
      trang_thai: true,
      lop_id: true,
      nguoi_tao_id: true,
      nguoi_tao: { select: { ho_ten: true } }
    },
    take: 20
  });
  
  console.log(`📊 Hoạt động ĐÃ DUYỆT nhưng KHÔNG có lop_id: ${orphan.length}\n`);
  orphan.forEach((a, i) => {
    console.log(`${i+1}. ${a.ten_hd.substring(0, 60)}`);
    console.log(`   - ID: ${a.id}`);
    console.log(`   - Trạng thái: ${a.trang_thai}`);
    console.log(`   - Người tạo: ${a.nguoi_tao?.ho_ten} (${a.nguoi_tao?.role})`);
    console.log(`   - nguoi_tao_id: ${a.nguoi_tao_id}`);
    console.log('');
  });

  // Đếm tổng số orphan toàn hệ thống
  const totalOrphan = await prisma.hoatDong.count({
    where: {
      trang_thai: { in: ['da_duyet', 'ket_thuc'] },
      lop_id: null
    }
  });
  console.log(`📊 Tổng hoạt động đã duyệt thiếu lop_id trong toàn hệ thống: ${totalOrphan}`);
}

main().catch(console.error).finally(() => prisma.$disconnect());
