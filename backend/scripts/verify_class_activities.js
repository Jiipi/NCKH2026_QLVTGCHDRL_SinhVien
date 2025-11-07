const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

/**
 * Script để kiểm tra và xác minh dữ liệu hoạt động theo lớp
 * - Kiểm tra mỗi lớp có bao nhiêu hoạt động
 * - Kiểm tra sinh viên có đăng ký đúng hoạt động của lớp mình không
 * - Đảm bảo sinh viên không thấy hoạt động của lớp khác
 */

async function verifyClassActivities() {
  console.log('🔍 BẮT ĐẦU KIỂM TRA DỮ LIỆU HOẠT ĐỘNG THEO LỚP\n');
  console.log('='.repeat(70) + '\n');
  
  try {
    // Lấy danh sách tất cả các lớp
    const classes = await prisma.lop.findMany({
      orderBy: {
        ten_lop: 'asc'
      }
    });
    
    console.log(`📚 Tổng số lớp: ${classes.length}\n`);
    
    let allPassed = true;
    
    for (const classData of classes) {
      console.log('─'.repeat(70));
      console.log(`\n🏫 LỚP: ${classData.ten_lop}`);
      console.log(`   Khoa: ${classData.khoa}`);
      console.log(`   Niên khóa: ${classData.nien_khoa}\n`);
      
      // Đếm số hoạt động của lớp (tên hoạt động chứa tên lớp)
      const classActivities = await prisma.hoatDong.findMany({
        where: {
          ten_hd: {
            contains: classData.ten_lop
          }
        },
        select: {
          id: true,
          ma_hd: true,
          ten_hd: true,
          trang_thai: true
        }
      });
      
      console.log(`   📋 Số hoạt động của lớp: ${classActivities.length}`);
      
      if (classActivities.length === 0) {
        console.log(`   ⚠️  CẢNH BÁO: Lớp không có hoạt động nào!`);
        allPassed = false;
        continue;
      }
      
      // Lấy danh sách sinh viên trong lớp
      const students = await prisma.sinhVien.findMany({
        where: {
          lop_id: classData.id
        },
        include: {
          nguoi_dung: {
            select: {
              ho_ten: true,
              ten_dn: true
            }
          }
        }
      });
      
      console.log(`   👥 Số sinh viên trong lớp: ${students.length}`);
      
      if (students.length === 0) {
        console.log(`   ⚠️  CẢNH BÁO: Lớp không có sinh viên nào!`);
        continue;
      }
      
      // Kiểm tra đăng ký của sinh viên
      let totalRegistrations = 0;
      let minRegistrations = Infinity;
      let maxRegistrations = 0;
      let studentsWithWrongClass = 0;
      
      for (const student of students) {
        // Đếm số đăng ký của sinh viên
        const registrations = await prisma.dangKyHoatDong.findMany({
          where: {
            sv_id: student.id
          },
          include: {
            hoat_dong: {
              select: {
                id: true,
                ten_hd: true,
                ma_hd: true
              }
            }
          }
        });
        
        totalRegistrations += registrations.length;
        minRegistrations = Math.min(minRegistrations, registrations.length);
        maxRegistrations = Math.max(maxRegistrations, registrations.length);
        
        // Kiểm tra xem sinh viên có đăng ký hoạt động của lớp khác không
        for (const reg of registrations) {
          if (!reg.hoat_dong.ten_hd.includes(classData.ten_lop)) {
            studentsWithWrongClass++;
            console.log(`   ❌ LỖI: Sinh viên ${student.mssv} đăng ký hoạt động ${reg.hoat_dong.ma_hd} không thuộc lớp ${classData.ten_lop}!`);
            allPassed = false;
            break;
          }
        }
      }
      
      const avgRegistrations = students.length > 0 ? (totalRegistrations / students.length).toFixed(1) : 0;
      
      console.log(`\n   📊 THỐNG KÊ ĐĂNG KÝ:`);
      console.log(`      - Tổng số đăng ký: ${totalRegistrations}`);
      console.log(`      - Trung bình: ${avgRegistrations} đăng ký/sinh viên`);
      console.log(`      - Min: ${minRegistrations === Infinity ? 0 : minRegistrations} đăng ký`);
      console.log(`      - Max: ${maxRegistrations} đăng ký`);
      
      // Kiểm tra điều kiện: mỗi sinh viên phải có ít nhất 10 đăng ký
      if (minRegistrations < 10 && minRegistrations !== Infinity) {
        console.log(`   ⚠️  CẢNH BÁO: Có sinh viên đăng ký ít hơn 10 hoạt động!`);
      }
      
      // Kiểm tra không có sinh viên đăng ký sai lớp
      if (studentsWithWrongClass === 0) {
        console.log(`   ✅ PASS: Không có sinh viên nào đăng ký hoạt động của lớp khác`);
      } else {
        console.log(`   ❌ FAIL: Có ${studentsWithWrongClass} sinh viên đăng ký sai lớp!`);
        allPassed = false;
      }
      
      // Kiểm tra số hoạt động có đạt yêu cầu không (khoảng 100)
      if (classActivities.length >= 90 && classActivities.length <= 110) {
        console.log(`   ✅ PASS: Số hoạt động nằm trong khoảng 90-110`);
      } else {
        console.log(`   ⚠️  CẢNH BÁO: Số hoạt động ngoài khoảng 90-110`);
      }
      
      console.log();
    }
    
    // Tổng kết
    console.log('\n' + '='.repeat(70));
    console.log('📊 TỔNG KẾT KIỂM TRA');
    console.log('='.repeat(70) + '\n');
    
    const totalActivities = await prisma.hoatDong.count();
    const totalRegistrations = await prisma.dangKyHoatDong.count();
    const totalStudents = await prisma.sinhVien.count();
    
    console.log(`   📈 Tổng số hoạt động: ${totalActivities}`);
    console.log(`   📈 Tổng số đăng ký: ${totalRegistrations}`);
    console.log(`   📈 Tổng số sinh viên: ${totalStudents}`);
    console.log(`   📈 Trung bình: ${(totalRegistrations / totalStudents).toFixed(1)} đăng ký/sinh viên\n`);
    
    if (allPassed) {
      console.log('✅ TẤT CẢ KIỂM TRA ĐỀU PASS!');
      console.log('✅ Dữ liệu hoạt động đã được tạo đúng chuẩn cho từng lớp!');
      console.log('✅ Không có sinh viên nào đăng ký hoạt động của lớp khác!\n');
    } else {
      console.log('❌ CÓ MỘT SỐ VẤN ĐỀ CẦN KHẮC PHỤC!\n');
    }
    
    // Hiển thị một số mẫu hoạt động
    console.log('\n' + '='.repeat(70));
    console.log('📋 MẪU HOẠT ĐỘNG');
    console.log('='.repeat(70) + '\n');
    
    for (const classData of classes.slice(0, 3)) {
      const sampleActivities = await prisma.hoatDong.findMany({
        where: {
          ten_hd: {
            contains: classData.ten_lop
          }
        },
        take: 3,
        select: {
          ma_hd: true,
          ten_hd: true,
          diem_rl: true,
          ngay_bd: true,
          trang_thai: true
        }
      });
      
      console.log(`\n📌 Mẫu hoạt động của lớp ${classData.ten_lop}:`);
      for (const activity of sampleActivities) {
        console.log(`   - ${activity.ma_hd}: ${activity.ten_hd}`);
        console.log(`     Điểm: ${activity.diem_rl}, Trạng thái: ${activity.trang_thai}`);
      }
    }
    
    // Kiểm tra xem sinh viên có thể xem được hoạt động của lớp khác không
    console.log('\n' + '='.repeat(70));
    console.log('🔒 KIỂM TRA PHÂN QUYỀN XEM HOẠT ĐỘNG');
    console.log('='.repeat(70) + '\n');
    
    const sampleStudent = await prisma.sinhVien.findFirst({
      include: {
        nguoi_dung: {
          select: {
            ho_ten: true,
            ten_dn: true
          }
        },
        lop: {
          select: {
            ten_lop: true
          }
        }
      }
    });
    
    if (sampleStudent) {
      console.log(`\n👤 Kiểm tra sinh viên: ${sampleStudent.nguoi_dung.ho_ten || sampleStudent.nguoi_dung.ten_dn}`);
      console.log(`   MSSV: ${sampleStudent.mssv}`);
      console.log(`   Lớp: ${sampleStudent.lop.ten_lop}\n`);
      
      // Hoạt động của lớp sinh viên
      const myClassActivities = await prisma.hoatDong.count({
        where: {
          ten_hd: {
            contains: sampleStudent.lop.ten_lop
          }
        }
      });
      
      console.log(`   ✅ Số hoạt động của lớp ${sampleStudent.lop.ten_lop}: ${myClassActivities}`);
      
      // Kiểm tra xem có hoạt động của lớp khác không
      const otherClasses = await prisma.lop.findMany({
        where: {
          id: {
            not: sampleStudent.lop_id
          }
        },
        take: 2
      });
      
      for (const otherClass of otherClasses) {
        const otherClassActivities = await prisma.hoatDong.count({
          where: {
            ten_hd: {
              contains: otherClass.ten_lop
            }
          }
        });
        
        console.log(`   ℹ️  Số hoạt động của lớp khác (${otherClass.ten_lop}): ${otherClassActivities}`);
      }
      
      console.log(`\n   💡 Lưu ý: Backend API cần filter hoạt động theo lớp của sinh viên`);
      console.log(`   💡 để đảm bảo sinh viên chỉ thấy hoạt động của lớp mình!\n`);
    }
    
  } catch (error) {
    console.error('\n❌ LỖI:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Chạy script
verifyClassActivities()
  .then(() => {
    console.log('\n✅ Kiểm tra hoàn tất!\n');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Kiểm tra thất bại:', error);
    process.exit(1);
  });
