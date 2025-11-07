const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

/**
 * Script để dọn dẹp các đăng ký hoạt động sai lớp
 * - Xóa các đăng ký mà sinh viên đăng ký hoạt động không thuộc lớp mình
 */

async function cleanupWrongClassRegistrations() {
  console.log('🧹 BẮT ĐẦU DỌN DẸP ĐĂNG KÝ SAI LỚP\n');
  console.log('='.repeat(70) + '\n');
  
  try {
    // Lấy tất cả sinh viên
    const students = await prisma.sinhVien.findMany({
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
    
    console.log(`👥 Tổng số sinh viên: ${students.length}\n`);
    
    let totalWrongRegistrations = 0;
    let totalDeletedRegistrations = 0;
    
    for (const student of students) {
      // Lấy tất cả đăng ký của sinh viên
      const registrations = await prisma.dangKyHoatDong.findMany({
        where: {
          sv_id: student.id
        },
        include: {
          hoat_dong: {
            select: {
              id: true,
              ma_hd: true,
              ten_hd: true
            }
          }
        }
      });
      
      // Kiểm tra các đăng ký sai lớp
      const wrongRegistrations = [];
      
      for (const reg of registrations) {
        // Nếu hoạt động không chứa tên lớp của sinh viên
        if (!reg.hoat_dong.ten_hd.includes(student.lop.ten_lop)) {
          wrongRegistrations.push(reg);
        }
      }
      
      if (wrongRegistrations.length > 0) {
        console.log(`\n❌ Sinh viên: ${student.nguoi_dung.ho_ten || student.nguoi_dung.ten_dn}`);
        console.log(`   MSSV: ${student.mssv}`);
        console.log(`   Lớp: ${student.lop.ten_lop}`);
        console.log(`   Số đăng ký sai lớp: ${wrongRegistrations.length}`);
        
        totalWrongRegistrations += wrongRegistrations.length;
        
        // Xóa các đăng ký sai
        for (const reg of wrongRegistrations) {
          try {
            await prisma.dangKyHoatDong.delete({
              where: {
                id: reg.id
              }
            });
            
            console.log(`   🗑️  Đã xóa: ${reg.hoat_dong.ma_hd} - ${reg.hoat_dong.ten_hd}`);
            totalDeletedRegistrations++;
          } catch (error) {
            console.error(`   ⚠️  Lỗi khi xóa đăng ký ${reg.id}:`, error.message);
          }
        }
      }
    }
    
    console.log('\n' + '='.repeat(70));
    console.log('📊 TỔNG KẾT DỌN DẸP');
    console.log('='.repeat(70) + '\n');
    
    console.log(`   📈 Tổng số đăng ký sai lớp: ${totalWrongRegistrations}`);
    console.log(`   🗑️  Tổng số đã xóa: ${totalDeletedRegistrations}`);
    
    if (totalWrongRegistrations === 0) {
      console.log('\n✅ KHÔNG CÓ ĐĂNG KÝ SAI LỚP NÀO!');
    } else if (totalDeletedRegistrations === totalWrongRegistrations) {
      console.log('\n✅ ĐÃ DỌN DẸP TẤT CẢ ĐĂNG KÝ SAI LỚP!');
    } else {
      console.log('\n⚠️  MỘT SỐ ĐĂNG KÝ CHƯA ĐƯỢC XÓA!');
    }
    
    // Kiểm tra lại sau khi dọn dẹp
    console.log('\n' + '='.repeat(70));
    console.log('🔍 KIỂM TRA LẠI SAU KHI DỌN DẸP');
    console.log('='.repeat(70) + '\n');
    
    const finalCheck = await prisma.sinhVien.findMany({
      include: {
        lop: {
          select: {
            ten_lop: true
          }
        },
        dang_ky_hd: {
          include: {
            hoat_dong: {
              select: {
                ten_hd: true
              }
            }
          }
        }
      }
    });
    
    let remainingWrong = 0;
    
    for (const student of finalCheck) {
      for (const reg of student.dang_ky_hd) {
        if (!reg.hoat_dong.ten_hd.includes(student.lop.ten_lop)) {
          remainingWrong++;
        }
      }
    }
    
    if (remainingWrong === 0) {
      console.log('✅ TẤT CẢ ĐĂNG KÝ ĐÃ ĐÚNG LỚP!\n');
    } else {
      console.log(`⚠️  Vẫn còn ${remainingWrong} đăng ký sai lớp!\n`);
    }
    
  } catch (error) {
    console.error('\n❌ LỖI:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Chạy script
cleanupWrongClassRegistrations()
  .then(() => {
    console.log('✅ Dọn dẹp hoàn tất!\n');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Dọn dẹp thất bại:', error);
    process.exit(1);
  });
