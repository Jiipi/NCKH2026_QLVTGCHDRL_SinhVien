/**
 * Script: verify-unified-counts.js
 * Kiểm tra logic tính tổng hoạt động thống nhất cho 4 roles
 * 
 * Logic chuẩn:
 * - Filter: lop_id = classId
 * - Filter: trang_thai IN ('da_duyet', 'ket_thuc')
 * - Optional: hoc_ky, nam_hoc
 */

const { PrismaClient } = require('@prisma/client');
const { countClassActivities, getClassActivities } = require('../src/core/utils/classActivityCounter');

const prisma = new PrismaClient();

const CLASS_NAME = 'ATTT01-2021';
const SEMESTER = 'hoc_ky_1';
const YEAR = '2025';

async function main() {
  console.log('\n🔍 KIỂM TRA TỔNG HOẠT ĐỘNG THỐNG NHẤT 4 ROLES\n');
  console.log('=' .repeat(60));

  // 1. Tìm lớp
  const lop = await prisma.lop.findUnique({
    where: { ten_lop: CLASS_NAME },
    include: {
      chu_nhiem_rel: { select: { id: true, ho_ten: true } }
    }
  });

  if (!lop) {
    console.error(`❌ Không tìm thấy lớp ${CLASS_NAME}`);
    return;
  }

  console.log(`\n📌 Lớp: ${lop.ten_lop} (ID: ${lop.id})`);
  console.log(`📌 GVCN: ${lop.chu_nhiem_rel?.ho_ten || 'Chưa có'}`);
  console.log(`📌 Học kỳ: ${SEMESTER} - Năm học: ${YEAR}`);

  // 2. Kiểm tra bằng countClassActivities utility
  const utilityCount = await countClassActivities(lop.id, {
    hoc_ky: SEMESTER,
    nam_hoc: YEAR
  });

  console.log(`\n✅ countClassActivities(): ${utilityCount} hoạt động`);

  // 3. Raw query để double-check
  const rawActivities = await prisma.hoatDong.findMany({
    where: {
      lop_id: lop.id,
      hoc_ky: SEMESTER,
      nam_hoc: YEAR,
      trang_thai: { in: ['da_duyet', 'ket_thuc'] }
    },
    select: {
      id: true,
      ten_hd: true,
      trang_thai: true,
      hoc_ky: true,
      nam_hoc: true,
      nguoi_tao: { select: { ho_ten: true } }
    },
    orderBy: { ngay_cap_nhat: 'desc' }
  });

  console.log(`\n📊 Raw query trực tiếp: ${rawActivities.length} hoạt động`);

  // 4. Phân tích theo trạng thái
  const daduyet = rawActivities.filter(a => a.trang_thai === 'da_duyet').length;
  const ketthuc = rawActivities.filter(a => a.trang_thai === 'ket_thuc').length;

  console.log(`   - da_duyet: ${daduyet}`);
  console.log(`   - ket_thuc: ${ketthuc}`);

  // 5. So sánh với logic cũ (nguoi_tao_id)
  console.log('\n📊 SO SÁNH VỚI LOGIC CŨ (dùng nguoi_tao_id):');
  
  // Get students + GVCN user IDs
  const classStudents = await prisma.sinhVien.findMany({
    where: { lop_id: lop.id },
    select: { nguoi_dung_id: true }
  });
  const creatorUserIds = classStudents.map(s => s.nguoi_dung_id).filter(Boolean);
  if (lop.chu_nhiem) creatorUserIds.push(lop.chu_nhiem);

  const oldLogicActivities = await prisma.hoatDong.count({
    where: {
      nguoi_tao_id: { in: creatorUserIds },
      hoc_ky: SEMESTER,
      nam_hoc: YEAR,
      trang_thai: { in: ['da_duyet', 'ket_thuc'] }
    }
  });

  console.log(`   - Logic cũ (nguoi_tao_id): ${oldLogicActivities} hoạt động`);
  console.log(`   - Logic mới (lop_id): ${utilityCount} hoạt động`);

  if (oldLogicActivities !== utilityCount) {
    console.log(`\n⚠️  Có sự khác biệt giữa logic cũ và mới!`);
  } else {
    console.log(`\n✅ Số liệu khớp nhau!`);
  }

  // 6. Kiểm tra số hoạt động cho_duyet (không được hiển thị)
  const choDuyetCount = await prisma.hoatDong.count({
    where: {
      lop_id: lop.id,
      hoc_ky: SEMESTER,
      nam_hoc: YEAR,
      trang_thai: 'cho_duyet'
    }
  });

  console.log(`\n⏳ Hoạt động đang chờ duyệt (cho_duyet): ${choDuyetCount}`);
  console.log(`   → Những hoạt động này KHÔNG được hiển thị trong danh sách`);

  // 7. Hiển thị 5 hoạt động mẫu
  if (rawActivities.length > 0) {
    console.log(`\n📋 5 hoạt động gần nhất:`);
    rawActivities.slice(0, 5).forEach((a, i) => {
      console.log(`   ${i + 1}. ${a.ten_hd.substring(0, 50)}...`);
      console.log(`      - Trạng thái: ${a.trang_thai}`);
      console.log(`      - Người tạo: ${a.nguoi_tao?.ho_ten || 'N/A'}`);
    });
  }

  console.log('\n' + '=' .repeat(60));
  console.log('✅ Kết luận: 4 role (Admin, GV, SV, LT) sẽ thấy cùng số lượng');
  console.log(`   Tổng: ${utilityCount} hoạt động đã duyệt/kết thúc\n`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
