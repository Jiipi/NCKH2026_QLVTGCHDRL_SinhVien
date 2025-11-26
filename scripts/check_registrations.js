const { PrismaClient } = require('../backend/node_modules/@prisma/client');
const prisma = new PrismaClient();

async function check() {
  console.log('='.repeat(60));
  console.log('KIỂM TRA DỮ LIỆU ĐĂNG KÝ HOẠT ĐỘNG');
  console.log('='.repeat(60));

  // 1. Kiểm tra tổng số đăng ký
  const totalRegs = await prisma.dangKyHoatDong.count();
  console.log('\n📊 TỔNG SỐ ĐĂNG KÝ:', totalRegs);

  // 2. Đếm theo trạng thái
  const byStatus = await prisma.dangKyHoatDong.groupBy({
    by: ['trang_thai_dk'],
    _count: true
  });
  console.log('\n📋 THEO TRẠNG THÁI:');
  byStatus.forEach(s => console.log('  -', s.trang_thai_dk + ':', s._count));

  // 3. Đếm theo học kỳ (thông qua hoạt động)
  const bySemester = await prisma.$queryRaw`
    SELECT hd.hoc_ky, hd.nam_hoc, COUNT(dk.id) as count
    FROM dang_ky_hoat_dong dk
    JOIN hoat_dong hd ON dk.hd_id = hd.id
    GROUP BY hd.hoc_ky, hd.nam_hoc
    ORDER BY hd.nam_hoc DESC, hd.hoc_ky DESC
  `;
  console.log('\n📅 THEO HỌC KỲ:');
  bySemester.forEach(s => console.log('  -', s.hoc_ky + '-' + s.nam_hoc + ':', Number(s.count)));

  // 4. Kiểm tra danh sách lớp
  const classes = await prisma.lop.findMany({
    select: { id: true, ten_lop: true, khoa: true },
    orderBy: { ten_lop: 'asc' }
  });
  const totalClasses = await prisma.lop.count();
  console.log('\n🏫 DANH SÁCH LỚP (Tổng:', totalClasses, ')');
  classes.slice(0, 10).forEach(c => console.log('  -', c.id, '-', c.ten_lop, '(' + (c.khoa || 'N/A') + ')'));
  if (totalClasses > 10) console.log('  ... và', totalClasses - 10, 'lớp khác');

  // 5. Đếm đăng ký theo lớp (top 5)
  const byClass = await prisma.$queryRaw`
    SELECT l.id, l.ten_lop, COUNT(dk.id) as count
    FROM dang_ky_hoat_dong dk
    JOIN sinh_vien sv ON dk.sv_id = sv.id
    JOIN lop l ON sv.lop_id = l.id
    GROUP BY l.id, l.ten_lop
    ORDER BY count DESC
    LIMIT 10
  `;
  console.log('\n🏆 TOP 10 LỚP CÓ NHIỀU ĐĂNG KÝ:');
  byClass.forEach(c => console.log('  -', c.ten_lop, '(id:', c.id + '):', Number(c.count), 'đăng ký'));

  // 6. Đếm theo lớp + học kỳ
  const byClassSemester = await prisma.$queryRaw`
    SELECT l.ten_lop, hd.hoc_ky, hd.nam_hoc, COUNT(dk.id) as count
    FROM dang_ky_hoat_dong dk
    JOIN sinh_vien sv ON dk.sv_id = sv.id
    JOIN lop l ON sv.lop_id = l.id
    JOIN hoat_dong hd ON dk.hd_id = hd.id
    GROUP BY l.id, l.ten_lop, hd.hoc_ky, hd.nam_hoc
    ORDER BY l.ten_lop, hd.nam_hoc DESC, hd.hoc_ky DESC
    LIMIT 20
  `;
  console.log('\n📊 ĐĂNG KÝ THEO LỚP + HỌC KỲ (20 đầu):');
  byClassSemester.forEach(c => console.log('  -', c.ten_lop, '|', c.hoc_ky + '-' + c.nam_hoc + ':', Number(c.count)));

  // 7. Kiểm tra API classes
  console.log('\n🔍 KIỂM TRA CẤU TRÚC DỮ LIỆU LỚP:');
  const sampleClass = await prisma.lop.findFirst({
    include: {
      _count: { select: { sinh_viens: true } }
    }
  });
  if (sampleClass) {
    console.log('  Sample class:', JSON.stringify(sampleClass, null, 2));
  }

  console.log('\n' + '='.repeat(60));
  console.log('HOÀN TẤT KIỂM TRA');
  console.log('='.repeat(60));

  await prisma.$disconnect();
}

check().catch(e => { 
  console.error('Lỗi:', e); 
  process.exit(1); 
});
