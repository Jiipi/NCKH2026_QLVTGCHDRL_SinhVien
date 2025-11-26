/**
 * Script tìm các hoạt động "bất thường" theo chuẩn mới:
 *  - Lọc theo học kỳ + năm học.
 *  - Tìm hoạt động KHÔNG ở trạng thái da_duyet / ket_thuc
 *    nhưng đã có đăng ký hoặc điểm danh.
 *
 * Chạy:
 *   cd backend
 *   node scripts/find-inconsistent-activities.js
 */

const { prisma } = require('../src/data/infrastructure/prisma/client');

async function main() {
  const hocKy = 'hoc_ky_1';
  const namHoc = '2025';

  console.log('=== Tìm hoạt động bất thường theo chuẩn duyệt ===');
  console.log('Học kỳ:', hocKy);
  console.log('Năm học:', namHoc);
  console.log('---------------------------------------');

  // Lấy các hoạt động cùng học kỳ nhưng chưa ở trạng thái đã duyệt / kết thúc
  const activities = await prisma.hoatDong.findMany({
    where: {
      hoc_ky: hocKy,
      nam_hoc: namHoc,
      trang_thai: { notIn: ['da_duyet', 'ket_thuc'] }
    },
    select: {
      id: true,
      ma_hd: true,
      ten_hd: true,
      trang_thai: true,
      hoc_ky: true,
      nam_hoc: true,
      dang_ky_hd: {
        select: {
          id: true,
          trang_thai_dk: true
        }
      }
    }
  });

  const inconsistent = activities
    .map(a => {
      const totalRegs = a.dang_ky_hd.length;
      const totalAttendance = 0;
      return {
        id: a.id,
        ma_hd: a.ma_hd,
        ten_hd: a.ten_hd,
        trang_thai: a.trang_thai,
        totalRegs,
        totalAttendance
      };
    })
    .filter(a => a.totalRegs > 0 || a.totalAttendance > 0);

  console.log(`Tổng hoạt động khác trạng thái da_duyet/ket_thuc trong HK1 ${namHoc}:`, activities.length);
  console.log(
    `Trong đó có ${inconsistent.length} hoạt động đã có đăng ký hoặc điểm danh (nên xem xét bổ sung duyệt):`
  );

  inconsistent.forEach(a => {
    console.log(
      `- ID=${a.id}, MA=${a.ma_hd || ''}, TEN="${a.ten_hd}", trang_thai="${a.trang_thai}", ` +
        `dang_ky=${a.totalRegs}, diem_danh=${a.totalAttendance}`
    );
  });

  console.log('\nGợi ý: duyệt lại các hoạt động trên (đổi trang_thai sang "da_duyet" hoặc "ket_thuc") để 4 role cùng thống nhất.');
}

main()
  .catch(err => {
    console.error('Lỗi khi quét hoạt động bất thường:', err);
    process.exitCode = 1;
  })
  .finally(async () => {
    try {
      await prisma.$disconnect();
    } catch (e) {
      // ignore
    }
  });


