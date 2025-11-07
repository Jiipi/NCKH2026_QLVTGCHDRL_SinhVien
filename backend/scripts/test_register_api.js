/**
 * Test script để validate API đăng ký với đầy đủ trường:
 * ngaySinh, gioiTinh, diaChi, sdt
 */

const axios = require('axios');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();
const API_URL = 'http://localhost:3001/api/auth/register';

async function testRegisterAPI() {
  console.log('=== Test API Đăng Ký với Đầy Đủ Trường ===\n');

  // Lấy lopId hợp lệ
  const lop = await prisma.lop.findFirst();
  if (!lop) {
    console.error('❌ Không tìm thấy lớp nào trong database');
    process.exit(1);
  }
  console.log(`✅ Sử dụng lớp: ${lop.ten_lop} (ID: ${lop.id})`);

  // Tạo test data với đầy đủ trường
  const randomMSSV = Date.now().toString().slice(-7); // 7 chữ số
  const testUser = {
    name: 'Nguyen Van Test',
    maso: randomMSSV,
    email: `test${Date.now()}@test.com`,
    password: 'Test@123456',
    confirmPassword: 'Test@123456', // Thêm confirmPassword
    lopId: lop.id,
    khoa: lop.khoa,
    // 4 trường mới:
    ngaySinh: '2003-05-15',
    gioiTinh: 'nam',
    diaChi: '123 Nguyen Trai, Quan 1, TP.HCM',
    sdt: '0912345678'
  };

  console.log('\n📤 Payload gửi đến backend:');
  console.log(JSON.stringify(testUser, null, 2));

  try {
    console.log('\n🔄 Đang gửi request...');
    const response = await axios.post(API_URL, testUser);

    console.log('\n✅ Đăng ký thành công!');
    console.log('Response status:', response.status);
    console.log('Response data:', JSON.stringify(response.data, null, 2));

    // Verify trong database
    console.log('\n🔍 Kiểm tra dữ liệu trong database...');
    const sinhVien = await prisma.sinh_vien.findFirst({
      where: { mssv: testUser.maso },
      include: {
        nguoi_dung: {
          select: {
            ho_ten: true,
            email: true
          }
        }
      }
    });

    if (!sinhVien) {
      console.error('❌ Không tìm thấy sinh viên trong database!');
      process.exit(1);
    }

    console.log('\n📊 Dữ liệu trong database:');
    console.log('MSSV:', sinhVien.mssv);
    console.log('Họ tên:', sinhVien.nguoi_dung.ho_ten);
    console.log('Ngày sinh:', sinhVien.ngay_sinh);
    console.log('Giới tính:', sinhVien.gt);
    console.log('Địa chỉ:', sinhVien.dia_chi);
    console.log('SĐT:', sinhVien.sdt);

    // Validate các trường mới
    const validationResults = {
      ngaySinh: sinhVien.ngay_sinh !== null && sinhVien.ngay_sinh.toISOString().includes('2003-05-15'),
      gioiTinh: sinhVien.gt === 'nam',
      diaChi: sinhVien.dia_chi === testUser.diaChi,
      sdt: sinhVien.sdt === testUser.sdt
    };

    console.log('\n✅ Kết quả validation:');
    Object.entries(validationResults).forEach(([field, isValid]) => {
      console.log(`  ${isValid ? '✅' : '❌'} ${field}: ${isValid ? 'PASS' : 'FAIL'}`);
    });

    const allValid = Object.values(validationResults).every(v => v === true);
    
    if (allValid) {
      console.log('\n🎉 TẤT CẢ TEST PASS! Backend đã lưu đầy đủ 4 trường mới!');
    } else {
      console.log('\n❌ CÓ TRƯỜNG CHƯA ĐƯỢC LƯU ĐÚNG!');
      process.exit(1);
    }

  } catch (error) {
    console.error('\n❌ Lỗi khi test API:');
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Data:', JSON.stringify(error.response.data, null, 2));
    } else {
      console.error(error.message);
    }
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

testRegisterAPI();
