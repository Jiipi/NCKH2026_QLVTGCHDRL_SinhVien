const http = require('http');
const jwt = require('jsonwebtoken');

async function decodeToken() {
  // Login first
  const loginData = JSON.stringify({ maso: 'gv001', password: '123456' });
  const loginOptions = {
    hostname: 'localhost',
    port: 5000,
    path: '/api/auth/login',
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Content-Length': loginData.length }
  };

  return new Promise((resolve, reject) => {
    const loginReq = http.request(loginOptions, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        const result = JSON.parse(data);
        const token = result.data?.token;
        if (!token) {
          console.error('Login failed:', result);
          return reject(new Error('No token'));
        }

        // Decode token (without verification - just to see payload)
        const decoded = jwt.decode(token);
        console.log('Token payload:', JSON.stringify(decoded, null, 2));
        resolve();
      });
    });
    loginReq.on('error', reject);
    loginReq.write(loginData);
    loginReq.end();
  });
}

decodeToken().catch(console.error);
