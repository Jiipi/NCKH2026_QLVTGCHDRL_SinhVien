/**
 * Script kiểm tra và thêm cột lop_id vào bảng hoat_dong
 * Sau đó chạy backfill để gán lop_id cho các hoạt động
 */

const { prisma } = require('../src/data/infrastructure/prisma/client');

async function checkColumnExists() {
  const result = await prisma.$queryRaw`
    SELECT column_name 
    FROM information_schema.columns 
    WHERE table_name = 'hoat_dong' AND column_name = 'lop_id'
  `;
  return result.length > 0;
}

async function addLopIdColumn() {
  console.log('🔧 Thêm cột lop_id vào bảng hoat_dong...');
  
  try {
    await prisma.$executeRawUnsafe(`
      ALTER TABLE "hoat_dong"
      ADD COLUMN IF NOT EXISTS "lop_id" uuid NULL
    `);
    console.log('✅ Đã thêm cột lop_id');
  } catch (err) {
    if (err.message.includes('already exists')) {
      console.log('ℹ️  Cột lop_id đã tồn tại');
    } else {
      throw err;
    }
  }
}

async function addForeignKey() {
  console.log('🔧 Thêm foreign key constraint...');
  
  try {
    // Kiểm tra constraint đã tồn tại chưa
    const existingConstraint = await prisma.$queryRaw`
      SELECT constraint_name 
      FROM information_schema.table_constraints 
      WHERE table_name = 'hoat_dong' AND constraint_name = 'hoat_dong_lop_id_fkey'
    `;
    
    if (existingConstraint.length > 0) {
      console.log('ℹ️  Foreign key đã tồn tại');
      return;
    }
    
    await prisma.$executeRawUnsafe(`
      ALTER TABLE "hoat_dong"
      ADD CONSTRAINT "hoat_dong_lop_id_fkey"
      FOREIGN KEY ("lop_id") REFERENCES "lop"("id")
      ON DELETE SET NULL ON UPDATE CASCADE
    `);
    console.log('✅ Đã thêm foreign key');
  } catch (err) {
    if (err.message.includes('already exists')) {
      console.log('ℹ️  Foreign key đã tồn tại');
    } else {
      throw err;
    }
  }
}

async function addIndex() {
  console.log('🔧 Tạo index cho lop_id...');
  
  try {
    await prisma.$executeRawUnsafe(`
      CREATE INDEX IF NOT EXISTS "hoat_dong_lop_id_idx" ON "hoat_dong"("lop_id")
    `);
    console.log('✅ Đã tạo index');
  } catch (err) {
    if (err.message.includes('already exists')) {
      console.log('ℹ️  Index đã tồn tại');
    } else {
      throw err;
    }
  }
}

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

async function backfillLopId() {
  console.log('\n📋 Bắt đầu backfill lop_id cho hoạt động...');

  // Lấy tất cả hoạt động chưa có lop_id
  const activities = await prisma.hoatDong.findMany({
    where: { lop_id: null },
    select: {
      id: true,
      ten_hd: true,
      nguoi_tao_id: true
    }
  });

  console.log(`📊 Tổng số hoạt động chưa có lop_id: ${activities.length}`);

  if (activities.length === 0) {
    console.log('✅ Tất cả hoạt động đã có lop_id');
    return;
  }

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

    if (updated % 20 === 0) {
      console.log(`   Đã gán lop_id cho ${updated} hoạt động...`);
    }
  }

  console.log('\n📊 Kết quả backfill:');
  console.log(`   ✅ Đã cập nhật: ${updated}`);
  console.log(`   ⏭️  Không xác định lớp (giữ null): ${skipped}`);
}

async function showStats() {
  console.log('\n📈 Thống kê sau migration:');
  
  const total = await prisma.hoatDong.count();
  const hasLopId = await prisma.hoatDong.count({ where: { lop_id: { not: null } } });
  const noLopId = await prisma.hoatDong.count({ where: { lop_id: null } });
  
  console.log(`   Tổng hoạt động: ${total}`);
  console.log(`   Có lop_id: ${hasLopId}`);
  console.log(`   Không có lop_id (hoạt động chung): ${noLopId}`);
  
  // Top 5 lớp có nhiều hoạt động nhất
  const topClasses = await prisma.$queryRaw`
    SELECT l.ma_lop, l.ten_lop, COUNT(h.id) as so_hoat_dong
    FROM hoat_dong h
    JOIN lop l ON h.lop_id = l.id
    GROUP BY l.id, l.ma_lop, l.ten_lop
    ORDER BY so_hoat_dong DESC
    LIMIT 5
  `;
  
  if (topClasses.length > 0) {
    console.log('\n   Top 5 lớp có nhiều hoạt động:');
    topClasses.forEach((c, i) => {
      console.log(`   ${i+1}. ${c.ma_lop} - ${c.ten_lop}: ${c.so_hoat_dong} hoạt động`);
    });
  }
}

async function main() {
  console.log('═══════════════════════════════════════════════════');
  console.log('🚀 MIGRATION: Thêm lop_id cho bảng hoat_dong');
  console.log('═══════════════════════════════════════════════════\n');

  // Bước 1: Kiểm tra cột đã tồn tại chưa
  const columnExists = await checkColumnExists();
  console.log(`📌 Cột lop_id đã tồn tại: ${columnExists ? 'Có' : 'Chưa'}\n`);

  // Bước 2: Thêm cột nếu chưa có
  if (!columnExists) {
    await addLopIdColumn();
  }

  // Bước 3: Thêm foreign key
  await addForeignKey();

  // Bước 4: Tạo index
  await addIndex();

  // Bước 5: Backfill lop_id
  await backfillLopId();

  // Bước 6: Hiển thị thống kê
  await showStats();

  console.log('\n═══════════════════════════════════════════════════');
  console.log('✅ MIGRATION HOÀN TẤT');
  console.log('═══════════════════════════════════════════════════');
}

main()
  .catch((err) => {
    console.error('\n❌ LỖI:', err.message);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
