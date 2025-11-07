const axios = require('axios');

const base = process.env.API_BASE || 'http://localhost:3001/api/auth';
// Default to a known existing email in the current DB; override with OTP_EMAIL
const email = process.env.OTP_EMAIL || 'admin@hcmute.edu.vn';
const newPass = process.env.OTP_NEWPASS || 'Admin@12345';

(async () => {
  try {
    console.log('1) Forgot -> sending code to', email);
    const forgot = await axios.post(`${base}/forgot`, { email });
    console.log('Forgot status:', forgot.status);
    console.log('Forgot resp:', JSON.stringify(forgot.data));
    const devOtp = forgot.data?.data?.devOtp || forgot.headers?.['x-dev-otp-code'];
    console.log('Dev OTP (if present):', devOtp || '(not exposed)');
    if (!devOtp) {
      console.log('No dev OTP available; check email delivery or logs.');
      process.exit(0);
    }

    console.log('\n2) Verify -> code', devOtp);
    const verify = await axios.post(`${base}/forgot/verify`, { email, code: String(devOtp) });
    console.log('Verify status:', verify.status, 'resp:', JSON.stringify(verify.data));

    console.log('\n3) Reset password');
    const reset = await axios.post(`${base}/reset`, { email, code: String(devOtp), password: newPass, confirmPassword: newPass });
    console.log('Reset status:', reset.status, 'resp:', JSON.stringify(reset.data));

    console.log('\n4) Try login with new password');
    // Login expects { maso, password }. For admin seed, maso=username 'admin'
    const login = await axios.post('http://localhost:3001/api/auth/login', { maso: 'admin', password: newPass });
    console.log('Login OK, token length:', (login.data?.data?.token || '').length);
    console.log('OTP flow smoke: SUCCESS');
  } catch (e) {
    if (e.response) {
      console.error('HTTP', e.response.status, JSON.stringify(e.response.data));
    } else {
      console.error('ERR', e.message);
    }
    process.exit(1);
  }
})();
