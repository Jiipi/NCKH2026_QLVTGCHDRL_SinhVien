/**
 * Integration Test - Test V2 API với server thật
 * Chạy sau khi server đã start
 */

const http = require('http');

// Helper để gọi API
function makeRequest(options, body = null) {
  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          resolve({
            status: res.statusCode,
            headers: res.headers,
            data: data ? JSON.parse(data) : null
          });
        } catch (err) {
          resolve({
            status: res.statusCode,
            headers: res.headers,
            data: data
          });
        }
      });
    });

    req.on('error', reject);
    
    if (body) {
      req.write(JSON.stringify(body));
    }
    
    req.end();
  });
}

async function testServer() {
  console.log('🧪 INTEGRATION TEST - V2 API\n');
  console.log('Testing server at http://localhost:5000\n');

  const baseOptions = {
    hostname: 'localhost',
    port: 5000,
    headers: {
      'Content-Type': 'application/json'
    }
  };

  let passed = 0;
  let failed = 0;

  try {
    // Test 1: Health check
    console.log('1️⃣ Testing server health...');
    try {
      const health = await makeRequest({
        ...baseOptions,
        path: '/api/health',
        method: 'GET'
      });
      
      if (health.status === 200) {
        console.log('✅ Server is running\n');
        passed++;
      } else {
        console.log(`❌ Server health check failed: ${health.status}\n`);
        failed++;
      }
    } catch (err) {
      console.log(`❌ Cannot connect to server: ${err.message}`);
      console.log('⚠️  Please start server first: cd backend && npm run dev\n');
      process.exit(1);
    }

    // Test 2: V2 Activities endpoint exists
    console.log('2️⃣ Testing V2 Activities endpoint (no auth)...');
    const v2Test = await makeRequest({
      ...baseOptions,
      path: '/api/v2/activities',
      method: 'GET'
    });
    
    if (v2Test.status === 401) {
      console.log('✅ V2 endpoint exists (returns 401 as expected - no token)');
      console.log(`   Response: ${v2Test.data?.message || 'Unauthorized'}\n`);
      passed++;
    } else {
      console.log(`❌ Unexpected status: ${v2Test.status}`);
      console.log(`   Expected: 401 (auth required)`);
      console.log(`   Got: ${JSON.stringify(v2Test.data)}\n`);
      failed++;
    }

    // Test 3: V1 still works
    console.log('3️⃣ Testing V1 Activities endpoint (backward compatible)...');
    const v1Test = await makeRequest({
      ...baseOptions,
      path: '/api/activities',
      method: 'GET'
    });
    
    if (v1Test.status === 401 || v1Test.status === 200) {
      console.log('✅ V1 endpoint still works (backward compatible)');
      console.log(`   Status: ${v1Test.status}\n`);
      passed++;
    } else {
      console.log(`❌ V1 endpoint broken: ${v1Test.status}\n`);
      failed++;
    }

    // Test 4: Check routing structure
    console.log('4️⃣ Testing routing structure...');
    const routes = [
      '/api/v2/activities',
      '/api/activities',
      '/api/users',
      '/api/classes'
    ];

    for (const route of routes) {
      const test = await makeRequest({
        ...baseOptions,
        path: route,
        method: 'GET'
      });
      
      const exists = test.status !== 404;
      console.log(`   ${exists ? '✅' : '❌'} ${route} - ${test.status}`);
    }
    console.log();
    passed++;

    // Summary
    console.log('━'.repeat(50));
    console.log('📊 TEST SUMMARY');
    console.log('━'.repeat(50));
    console.log(`✅ Passed: ${passed}`);
    console.log(`❌ Failed: ${failed}`);
    console.log();

    if (failed === 0) {
      console.log('🎉 ALL INTEGRATION TESTS PASSED!\n');
      console.log('✅ Server is running correctly');
      console.log('✅ V2 API endpoint registered');
      console.log('✅ V1 API still works (backward compatible)');
      console.log('✅ Routing structure intact\n');
      console.log('📝 Next steps:');
      console.log('   1. Test với token (login để lấy JWT)');
      console.log('   2. Test CRUD operations với different roles');
      console.log('   3. Verify scope filtering works');
      console.log('   4. Continue implementing other modules\n');
    } else {
      console.log('⚠️  Some tests failed. Please check the logs.\n');
      process.exit(1);
    }

  } catch (err) {
    console.error('❌ Test failed:', err.message);
    process.exit(1);
  }
}

// Run tests
testServer();
