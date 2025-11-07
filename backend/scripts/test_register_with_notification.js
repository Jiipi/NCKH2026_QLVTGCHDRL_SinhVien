const axios = require('axios');

const API_URL = 'http://localhost:3001/api/auth';

async function testRegistrationWithNotification() {
  const uniqueId = Math.floor(Math.random() * 1000);
  const payload = {
    maso: `2028${String(uniqueId).padStart(3, '0')}`, // Đúng 7 số
    name: 'Nguyen Van Test Notification',
    email: `test${Date.now()}@student.dlu.edu.vn`,
    password: 'Test@123456',
    confirmPassword: 'Test@123456',
    lopId: '1979ac7b-6e2b-4958-8be2-59b03cb120b1', // KHMT02-2021 (có lớp trưởng)
    khoa: 'Kỹ thuật phần mềm',
    ngaySinh: '2003-05-15',
    gioiTinh: 'nam',
    diaChi: '123 Test Street',
    sdt: '0901234567'
  };

  console.log('📝 Đăng ký user mới với thông tin:');
  console.log('- MSSV:', payload.maso);
  console.log('- Tên:', payload.name);
  console.log('- Lớp: KHMT02-2021');
  console.log('- Khoa:', payload.khoa);

  try {
    const response = await axios.post(`${API_URL}/register`, payload);
    console.log('\n✅ Đăng ký thành công!');
    console.log('Response:', response.data);
    
    // Đợi 2s để backend xử lý notification
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Kiểm tra notification trong DB
    console.log('\n🔍 Kiểm tra notifications trong database...');
    const { execSync } = require('child_process');
    const query = `SELECT tb.tieu_de, tb.noi_dung, ng_nhan.ho_ten as nguoi_nhan, ng_gui.ho_ten as nguoi_gui, tb.ngay_gui FROM thong_bao tb JOIN nguoi_dung ng_nhan ON tb.nguoi_nhan_id = ng_nhan.id JOIN nguoi_dung ng_gui ON tb.nguoi_gui_id = ng_gui.id WHERE tb.noi_dung LIKE '%${payload.maso}%' ORDER BY tb.ngay_gui DESC;`;
    
    const result = execSync(`docker exec -it dacn_db psql -U admin -d Web_QuanLyDiemRenLuyen -c "${query}"`, { encoding: 'utf-8' });
    console.log(result);
    
  } catch (error) {
    console.error('❌ Lỗi:', error.response?.data || error.message);
  }
}

testRegistrationWithNotification();
