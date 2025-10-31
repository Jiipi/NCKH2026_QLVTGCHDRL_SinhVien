/**
 * Script: Bổ sung các trường dữ liệu còn thiếu
 * 
 * Script này sẽ kiểm tra và cập nhật các trường dữ liệu còn thiếu trong database
 * 
 * Cách chạy:
 *   cd backend
 *   node scripts/update_missing_fields.js
 */

require('dotenv').config();

const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

function randomElement(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function generatePhoneNumber() {
  const prefixes = ['090', '091', '093', '094', '097', '098', '086', '088', '089'];
  return `${randomElement(prefixes)}${randomInt(1000000, 9999999)}`;
}

function generateAddress() {
  const streets = ['Lê Lợi', 'Nguyễn Huệ', 'Trần Hưng Đạo', 'Hai Bà Trưng', 'Lý Thường Kiệt', 'Võ Văn Tần', 'Pasteur', 'Điện Biên Phủ'];
  const districts = ['Quận 1', 'Quận 3', 'Quận 5', 'Quận 7', 'Quận 10', 'Thủ Đức', 'Bình Thạnh', 'Gò Vấp'];
  return `${randomInt(1, 500)} ${randomElement(streets)}, ${randomElement(districts)}, TP.HCM`;
}

async function main() {
  console.log('🔍 BẮT ĐẦU KIỂM TRA VÀ BỔ SUNG DỮ LIỆU\n');
  console.log('='.repeat(60));

  try {
    // 1. Cập nhật sinh viên thiếu thông tin
    console.log('\n📋 Bước 1: Kiểm tra sinh viên thiếu thông tin...');
    
    const studentsNeedUpdate = await prisma.sinhVien.findMany({
      where: {
        OR: [
          { dia_chi: null },
          { sdt: null },
          { email: null },
          { gt: null }
        ]
      }
    });

    console.log(`   Tìm thấy ${studentsNeedUpdate.length} sinh viên cần cập nhật`);

    for (const student of studentsNeedUpdate) {
      await prisma.sinhVien.update({
        where: { id: student.id },
        data: {
          dia_chi: student.dia_chi || generateAddress(),
          sdt: student.sdt || generatePhoneNumber(),
          email: student.email || `${student.mssv}@student.edu.vn`,
          gt: student.gt || randomElement(['nam', 'nu'])
        }
      });
    }

    console.log(`   ✅ Đã cập nhật ${studentsNeedUpdate.length} sinh viên`);

    // 2. Cập nhật người dùng thiếu họ tên
    console.log('\n📋 Bước 2: Kiểm tra người dùng thiếu họ tên...');
    
    const usersNeedUpdate = await prisma.nguoiDung.findMany({
      where: {
        ho_ten: null
      }
    });

    console.log(`   Tìm thấy ${usersNeedUpdate.length} người dùng cần cập nhật`);

    const hoList = ['Nguyễn', 'Trần', 'Lê', 'Phạm', 'Hoàng', 'Huỳnh', 'Phan', 'Vũ', 'Võ', 'Đặng'];
    const tenDemList = ['Văn', 'Thị', 'Hữu', 'Đức', 'Minh', 'Quốc', 'Anh', 'Thanh'];
    const tenList = ['Hùng', 'Dũng', 'Linh', 'Hương', 'Mai', 'Lan', 'Hải', 'Long', 'Tuấn', 'Hiếu'];

    for (const user of usersNeedUpdate) {
      const hoTen = `${randomElement(hoList)} ${randomElement(tenDemList)} ${randomElement(tenList)}`;
      await prisma.nguoiDung.update({
        where: { id: user.id },
        data: { ho_ten: hoTen }
      });
    }

    console.log(`   ✅ Đã cập nhật ${usersNeedUpdate.length} người dùng`);

    // 3. Cập nhật hoạt động thiếu thông tin
    console.log('\n📋 Bước 3: Kiểm tra hoạt động thiếu thông tin...');
    
    const activitiesNeedUpdate = await prisma.hoatDong.findMany({
      where: {
        OR: [
          { mo_ta: null },
          { dia_diem: null },
          { don_vi_to_chuc: null },
          { yeu_cau_tham_gia: null }
        ]
      }
    });

    console.log(`   Tìm thấy ${activitiesNeedUpdate.length} hoạt động cần cập nhật`);

    const locations = ['Phòng A101', 'Phòng B202', 'Hội trường C', 'Sân vận động', 'Phòng thực hành 1', 'Phòng họp 2', 'Giảng đường lớn', 'Phòng máy tính', 'Thư viện', 'Sân chơi'];

    for (const activity of activitiesNeedUpdate) {
      await prisma.hoatDong.update({
        where: { id: activity.id },
        data: {
          mo_ta: activity.mo_ta || `Mô tả chi tiết cho hoạt động ${activity.ten_hd}. Đây là một hoạt động bổ ích cho sinh viên.`,
          dia_diem: activity.dia_diem || randomElement(locations),
          don_vi_to_chuc: activity.don_vi_to_chuc || 'Khoa CNTT',
          yeu_cau_tham_gia: activity.yeu_cau_tham_gia || 'Tất cả sinh viên'
        }
      });
    }

    console.log(`   ✅ Đã cập nhật ${activitiesNeedUpdate.length} hoạt động`);

    // 4. Cập nhật đăng ký thiếu ghi chú cho trạng thái đã duyệt
    console.log('\n📋 Bước 4: Kiểm tra đăng ký thiếu ghi chú...');
    
    const registrationsNeedUpdate = await prisma.dangKyHoatDong.findMany({
      where: {
        trang_thai_dk: 'da_duyet',
        ghi_chu: null
      }
    });

    console.log(`   Tìm thấy ${registrationsNeedUpdate.length} đăng ký cần cập nhật`);

    for (const registration of registrationsNeedUpdate) {
      await prisma.dangKyHoatDong.update({
        where: { id: registration.id },
        data: {
          ghi_chu: '[Giảng viên] Đã phê duyệt đăng ký'
        }
      });
    }

    console.log(`   ✅ Đã cập nhật ${registrationsNeedUpdate.length} đăng ký`);

    // 5. Cập nhật loại hoạt động thiếu màu sắc
    console.log('\n📋 Bước 5: Kiểm tra loại hoạt động thiếu màu sắc...');
    
    const activityTypesNeedUpdate = await prisma.loaiHoatDong.findMany({
      where: { mau_sac: null }
    });

    console.log(`   Tìm thấy ${activityTypesNeedUpdate.length} loại hoạt động cần cập nhật`);

    const colors = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899', '#06B6D4', '#84CC16'];

    for (let i = 0; i < activityTypesNeedUpdate.length; i++) {
      const type = activityTypesNeedUpdate[i];
      await prisma.loaiHoatDong.update({
        where: { id: type.id },
        data: { mau_sac: colors[i % colors.length] }
      });
    }

    console.log(`   ✅ Đã cập nhật ${activityTypesNeedUpdate.length} loại hoạt động`);

    // 7. Thống kê cuối cùng
    console.log('\n' + '='.repeat(60));
    console.log('📊 THỐNG KÊ SAU KHI CẬP NHẬT:');
    console.log('='.repeat(60));

    const stats = {
      sinhVienDayDu: await prisma.sinhVien.count({
        where: {
          AND: [
            { dia_chi: { not: null } },
            { sdt: { not: null } },
            { email: { not: null } },
            { gt: { not: null } }
          ]
        }
      }),
      nguoiDungDayDu: await prisma.nguoiDung.count({
        where: { ho_ten: { not: null } }
      }),
      hoatDongDayDu: await prisma.hoatDong.count({
        where: {
          AND: [
            { mo_ta: { not: null } },
            { dia_diem: { not: null } },
            { don_vi_to_chuc: { not: null } }
          ]
        }
      }),
      loaiHoatDongCoMau: await prisma.loaiHoatDong.count({
        where: { mau_sac: { not: null } }
      })
    };

    const totalSinhVien = await prisma.sinhVien.count();
    const totalNguoiDung = await prisma.nguoiDung.count();
    const totalHoatDong = await prisma.hoatDong.count();
    const totalLoaiHoatDong = await prisma.loaiHoatDong.count();

    console.log(`Sinh viên đầy đủ thông tin:    ${stats.sinhVienDayDu}/${totalSinhVien} (${(stats.sinhVienDayDu/totalSinhVien*100).toFixed(1)}%)`);
    console.log(`Người dùng có họ tên:          ${stats.nguoiDungDayDu}/${totalNguoiDung} (${(stats.nguoiDungDayDu/totalNguoiDung*100).toFixed(1)}%)`);
    console.log(`Hoạt động đầy đủ thông tin:    ${stats.hoatDongDayDu}/${totalHoatDong} (${(stats.hoatDongDayDu/totalHoatDong*100).toFixed(1)}%)`);
    console.log(`Loại hoạt động có màu sắc:     ${stats.loaiHoatDongCoMau}/${totalLoaiHoatDong} (${(stats.loaiHoatDongCoMau/totalLoaiHoatDong*100).toFixed(1)}%)`);

    console.log('\n' + '='.repeat(60));
    console.log('✅ HOÀN TẤT BỔ SUNG DỮ LIỆU!');
    console.log('='.repeat(60));

  } catch (error) {
    console.error('\n❌ LỖI:', error.message);
    console.error(error);
  } finally {
    await prisma.$disconnect();
  }
}

// Chạy script
main()
  .then(() => {
    console.log('\n✅ Script hoàn tất\n');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Script thất bại:', error);
    process.exit(1);
  });
