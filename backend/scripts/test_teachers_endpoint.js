/**
 * Script test endpoint /core/users?role=GIANG_VIEN
 * Để debug vì sao frontend không nhận được dữ liệu giảng viên
 */

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function testTeachersEndpoint() {
  console.log('='.repeat(80));
  console.log('🧪 TEST GIẢNG VIÊN ENDPOINT');
  console.log('='.repeat(80));
  console.log();

  try {
    // 1. Kiểm tra vai trò GIANG_VIEN
    console.log('1️⃣  Kiểm tra vai trò GIANG_VIEN...');
    const roles = await prisma.vaiTro.findMany({
      where: {
        OR: [
          { ten_vt: { contains: 'GIANG', mode: 'insensitive' } },
          { ten_vt: { contains: 'VIEN', mode: 'insensitive' } },
          { ten_vt: { equals: 'GV', mode: 'insensitive' } }
        ]
      },
      include: {
        _count: { select: { nguoi_dungs: true } }
      }
    });
    
    console.log(`✅ Tìm thấy ${roles.length} vai trò liên quan:`);
    roles.forEach(r => {
      console.log(`   - ${r.ten_vt}: ${r._count.nguoi_dungs} người dùng`);
    });
    console.log();

    // 2. Query users với role GIANG_VIEN (như service)
    console.log('2️⃣  Query users với vai trò GIANG_VIEN...');
    const teacherVariants = ['GIANG_VIEN', 'GIANG VIEN', 'Giảng viên', 'GIẢNG_VIÊN', 'GV'];
    
    const teachers = await prisma.nguoiDung.findMany({
      where: {
        trang_thai: 'hoat_dong',
        vai_tro: {
          ten_vt: { in: teacherVariants, mode: 'insensitive' }
        }
      },
      include: {
        vai_tro: { select: { ten_vt: true } },
        sinh_vien: {
          include: {
            lop: { select: { ten_lop: true } }
          }
        }
      },
      take: 20
    });

    console.log(`✅ Tìm thấy ${teachers.length} giảng viên:`);
    teachers.forEach((t, idx) => {
      console.log(`   ${idx + 1}. ${t.ho_ten || t.ten_dn} (${t.vai_tro?.ten_vt})`);
      console.log(`      Email: ${t.email || 'N/A'}`);
    });
    console.log();

    // 3. Fallback: Homeroom teachers from classes
    if (teachers.length === 0) {
      console.log('3️⃣  Fallback: Lấy GVCN từ bảng lop...');
      const classes = await prisma.lop.findMany({
        where: {
          chu_nhiem: { not: null }
        },
        select: {
          id: true,
          ten_lop: true,
          chu_nhiem: true,
          chu_nhiem_rel: {
            select: {
              id: true,
              ho_ten: true,
              ten_dn: true,
              email: true,
              vai_tro: { select: { ten_vt: true } }
            }
          }
        },
        take: 10
      });

      const homeroomTeachers = classes
        .map(c => c.chu_nhiem_rel)
        .filter(Boolean);

      console.log(`✅ Tìm thấy ${homeroomTeachers.length} GVCN từ ${classes.length} lớp:`);
      homeroomTeachers.forEach((t, idx) => {
        console.log(`   ${idx + 1}. ${t.ho_ten || t.ten_dn} (${t.vai_tro?.ten_vt || 'N/A'})`);
        console.log(`      Email: ${t.email || 'N/A'}`);
      });
      console.log();
    }

    // 4. Test transformation (như service)
    console.log('4️⃣  Test transformation (format frontend mong đợi)...');
    const transformed = teachers.slice(0, 3).map(u => ({
      id: u.id,
      fullName: u.ho_ten || u.ten_dn,
      email: u.email,
      role: u.vai_tro?.ten_vt,
      isActive: u.trang_thai === 'hoat_dong',
      class: u.sinh_vien?.lop?.ten_lop || null
    }));

    console.log('✅ Sample transformed data (3 records):');
    console.log(JSON.stringify(transformed, null, 2));
    console.log();

    // 5. Check response structure
    console.log('5️⃣  Expected API response structure:');
    const apiResponse = {
      success: true,
      data: {
        items: transformed,
        total: teachers.length
      },
      message: 'Danh sách người dùng'
    };
    console.log(JSON.stringify(apiResponse, null, 2));
    console.log();

    console.log('='.repeat(80));
    console.log('📝 KẾT LUẬN');
    console.log('='.repeat(80));
    if (teachers.length > 0) {
      console.log(`✅ Có ${teachers.length} giảng viên trong hệ thống`);
      console.log('✅ Backend service hoạt động bình thường');
      console.log('💡 Vấn đề có thể ở:');
      console.log('   1. Route không được register đúng');
      console.log('   2. Middleware chặn request');
      console.log('   3. Frontend parse response sai');
      console.log('   4. Backend không chạy hoặc chạy sai port');
    } else {
      console.log('⚠️  Không tìm thấy giảng viên với vai trò variants');
      console.log('💡 Kiểm tra:');
      console.log('   1. Vai trò GIANG_VIEN có tồn tại trong bảng vai_tro?');
      console.log('   2. Có user nào được gán vai trò này?');
      console.log('   3. User có trang_thai = "hoat_dong"?');
    }
    console.log('='.repeat(80));

  } catch (error) {
    console.error('❌ LỖI:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testTeachersEndpoint().catch(console.error);
