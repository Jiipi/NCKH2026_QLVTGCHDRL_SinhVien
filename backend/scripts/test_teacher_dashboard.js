const http = require('http');

async function testDashboard() {
  // Login first
  const loginData = JSON.stringify({ maso: 'gv001', password: '123456' });
  const loginOptions = {
    hostname: 'localhost',
    port: 3001,
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

        // Now test dashboard
        const dashOptions = {
          hostname: 'localhost',
          port: 3001,
          path: '/api/core/teachers/dashboard',
          method: 'GET',
          headers: { 'Authorization': `Bearer ${token}` }
        };

        const dashReq = http.request(dashOptions, (dashRes) => {
          let dashData = '';
          dashRes.on('data', chunk => dashData += chunk);
          dashRes.on('end', () => {
            const dashResult = JSON.parse(dashData);
            console.log('Dashboard Response:', JSON.stringify(dashResult, null, 2));
            if (dashResult.data?.classes) {
              console.log('\n✅ Classes count:', dashResult.data.classes.length);
              console.log('Classes:', dashResult.data.classes.map(c => c.ten_lop));
            }
            resolve();
          });
        });
        dashReq.on('error', reject);
        dashReq.end();
      });
    });
    loginReq.on('error', reject);
    loginReq.write(loginData);
    loginReq.end();
  });
}

testDashboard().catch(console.error);
