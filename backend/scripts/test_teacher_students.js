const http = require('http');

async function testStudents() {
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

        // Test dashboard with semester filter
        const dashOptions = {
          hostname: 'localhost',
          port: 3001,
          path: '/api/core/teachers/dashboard?semester=hoc_ky_1-2025&classId=2d4093ef-57f1-4cd0-887b-ce6bbdff903a',
          method: 'GET',
          headers: { 'Authorization': `Bearer ${token}` }
        };

        const dashReq = http.request(dashOptions, (dashRes) => {
          let dashData = '';
          dashRes.on('data', chunk => dashData += chunk);
          dashRes.on('end', () => {
            const dashResult = JSON.parse(dashData);
            if (dashResult.success && dashResult.data?.students) {
              const students = dashResult.data.students;
              console.log('\n✅ Students count:', students.length);
              console.log('\nTop 5 students by score:');
              const sorted = [...students].sort((a, b) => b.diem_rl - a.diem_rl);
              sorted.slice(0, 5).forEach((s, i) => {
                console.log(`${i + 1}. ${s.mssv} - ${s.ho_ten}: ${s.diem_rl} điểm`);
              });
            } else {
              console.error('Error:', dashResult);
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

testStudents().catch(console.error);
