/**
 * Script gán lop_id cho các hoạt động (HoatDong) hiện có.
 *
 * Ý tưởng:
 * - Chỉ chạy được sau khi DB đã có cột `lop_id` trong bảng `hoat_dong`.
 * - Với mỗi hoạt động chưa có lop_id:
 *    1. Nếu người tạo là sinh viên  -> lấy sinh_vien.lop_id.
 *    2. Nếu người tạo là GVCN       -> tìm lớp có chu_nhiem = nguoi_tao_id, gán lop_id lớp đó.
 * - Các hoạt động không suy ra được lớp sẽ giữ nguyên lop_id = null (coi là hoạt động chung toàn trường).
 *
 * Cách chạy:
 *   cd backend
 *   node scripts/backfill-activity-class.js
 */

const { prisma } = require('../src/data/infrastructure/prisma/client');

async function resolveClassForCreator(userId) {
  if (!userId) return null;

  // 1. Thử xem user là sinh viên của lớp nào
  const student = await prisma.sinhVien.findUnique({
    where: { nguoi_dung_id: userId },
    select: { lop_id: true }
  });

  if (student?.lop_id) {
    return student.lop_id;
  }

  // 2. Nếu không phải sinh viên, thử xem user là GVCN lớp nào
  const lop = await prisma.lop.findFirst({
    where: { chu_nhiem: userId },
    select: { id: true }
  });

  return lop?.id || null;
}

async function main() {
  console.log('=== Backfill lop_id cho hoat_dong ===');

  // Lấy tất cả hoạt động chưa có lop_id
  const activities = await prisma.hoatDong.findMany({
    where: { lop_id: null },
    select: {
      id: true,
      ten_hd: true,
      nguoi_tao_id: true
    }
  });

  console.log('Tổng số hoạt động chưa có lop_id:', activities.length);

  let updated = 0;
  let skipped = 0;

  for (const activity of activities) {
    const classId = await resolveClassForCreator(activity.nguoi_tao_id);

    if (!classId) {
      skipped++;
      continue;
    }

    await prisma.hoatDong.update({
      where: { id: activity.id },
      data: { lop_id: classId }
    });

    updated++;

    if (updated % 50 === 0) {
      console.log(`Đã gán lop_id cho ${updated} hoạt động...`);
    }
  }

  console.log('=== Hoàn tất backfill lop_id ===');
  console.log('Đã cập nhật      :', updated);
  console.log('Không xác định lớp:', skipped);
}

main()
  .catch((err) => {
    console.error('Lỗi khi backfill lop_id:', err);
    process.exitCode = 1;
  })
  .finally(async () => {
    try {
      await prisma.$disconnect();
    } catch (e) {
      // ignore
    }
  });


