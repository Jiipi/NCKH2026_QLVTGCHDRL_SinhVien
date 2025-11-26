/**
 * Script đếm số hoạt động theo học kỳ + lớp để so khớp với Prisma Studio.
 *
 * - Đếm tổng hoạt động toàn hệ thống cho học kỳ/năm học.
 * - Đếm tổng hoạt động được tạo bởi sinh viên trong một lớp cụ thể.
 *
 * Chạy:
 *   cd backend
 *   node scripts/count-class-activities.js
 */

const { prisma } = require('../src/data/infrastructure/prisma/client');

async function main() {
  const hocKy = 'hoc_ky_1';
  const namHoc = '2025';
  const tenLop = 'ATTT01-2021';

  console.log('=== Đếm hoạt động theo học kỳ & lớp ===');
  console.log('Học kỳ:', hocKy);
  console.log('Năm học:', namHoc);
  console.log('Lớp:', tenLop);
  console.log('---------------------------------------');

  // Tổng hoạt động toàn hệ thống trong học kỳ này (chỉ tính đã duyệt / kết thúc)
  const totalInSemester = await prisma.hoatDong.count({
    where: {
      hoc_ky: hocKy,
      nam_hoc: namHoc,
      trang_thai: { in: ['da_duyet', 'ket_thuc'] }
    }
  });

  // Tổng hoạt động do sinh viên lớp này tạo trong học kỳ (chỉ tính đã duyệt / kết thúc)
  const totalForClass = await prisma.hoatDong.count({
    where: {
      hoc_ky: hocKy,
      nam_hoc: namHoc,
      trang_thai: { in: ['da_duyet', 'ket_thuc'] },
      nguoi_tao: {
        sinh_vien: {
          lop: {
            ten_lop: tenLop
          }
        }
      }
    }
  });

  console.log('Tổng hoạt động toàn hệ thống (HK1 2025):', totalInSemester);
  console.log(`Tổng hoạt động của lớp ${tenLop} (HK1 2025):`, totalForClass);

  // In dạng JSON cho dễ so sánh/log lại
  console.log(
    '\nJSON:',
    JSON.stringify(
      {
        hocKy,
        namHoc,
        tenLop,
        totalInSemester,
        totalForClass
      },
      null,
      2
    )
  );
}

main()
  .catch((err) => {
    console.error('Lỗi khi đếm hoạt động:', err);
    process.exitCode = 1;
  })
  .finally(async () => {
    try {
      await prisma.$disconnect();
    } catch (e) {
      // ignore
    }
  });


