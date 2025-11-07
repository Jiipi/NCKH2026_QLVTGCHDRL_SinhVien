const axios = require('axios');

const base = 'http://localhost:3001/api/auth';
const email = '2212377@dlu.edu.vn';

(async () => {
  try {
    console.log('=== TEST OTP CHO EMAIL:', email, '===\n');
    
    console.log('1) Gửi yêu cầu forgot password...');
    const forgot = await axios.post(`${base}/forgot`, { email });
    console.log('   Status:', forgot.status);
    console.log('   Response:', JSON.stringify(forgot.data, null, 2));
    
    const devOtp = forgot.data?.data?.devOtp || forgot.headers?.['x-dev-otp-code'];
    if (devOtp) {
      console.log('\n✅ Nhận được mã OTP:', devOtp);
      console.log('   (Trong production, mã sẽ được gửi qua email)');
    } else {
      console.log('\n❌ Không nhận được mã OTP trong response dev');
      console.log('   Có thể email không tồn tại hoặc đang ở môi trường production');
    }
    
  } catch (e) {
    if (e.response) {
      console.error('❌ Lỗi HTTP', e.response.status);
      console.error('   Response:', JSON.stringify(e.response.data, null, 2));
    } else {
      console.error('❌ Lỗi:', e.message);
    }
    process.exit(1);
  }
})();
