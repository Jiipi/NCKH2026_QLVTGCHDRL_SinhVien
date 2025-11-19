/**
 * Test Script - Kiểm tra server có start được và test các endpoint quan trọng
 * 
 * Test các endpoint:
 * - Health check
 * - Auth endpoints
 * - Activities endpoints (đặc biệt QR data)
 * - Users endpoints
 */

const http = require('http');

const BASE_URL = process.env.API_URL || 'http://localhost:3001';
const TIMEOUT = 5000; // 5 seconds

const testResults = {
  passed: [],
  failed: [],
  skipped: []
};

/**
 * Test một endpoint
 */
function testEndpoint(method, path, description, expectedStatus = 200, token = null) {
  return new Promise((resolve) => {
    const url = new URL(path, BASE_URL);
    const options = {
      method: method,
      path: url.pathname + url.search,
      headers: {
        'Content-Type': 'application/json'
      }
    };

    if (token) {
      options.headers['Authorization'] = `Bearer ${token}`;
    }

    const req = http.request(options, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });

      res.on('end', () => {
        const success = res.statusCode === expectedStatus || (expectedStatus === 'any' && res.statusCode < 500);
        
        if (success) {
          testResults.passed.push({
            endpoint: `${method} ${path}`,
            status: res.statusCode,
            description
          });
          console.log(`  ✅ ${method} ${path} - Status: ${res.statusCode}`);
        } else {
          testResults.failed.push({
            endpoint: `${method} ${path}`,
            expected: expectedStatus,
            actual: res.statusCode,
            description,
            response: data.substring(0, 200)
          });
          console.log(`  ❌ ${method} ${path} - Expected: ${expectedStatus}, Got: ${res.statusCode}`);
        }
        
        resolve(success);
      });
    });

    req.on('error', (error) => {
      testResults.failed.push({
        endpoint: `${method} ${path}`,
        error: error.message,
        description
      });
      console.log(`  ❌ ${method} ${path} - Error: ${error.message}`);
      resolve(false);
    });

    req.on('timeout', () => {
      req.destroy();
      testResults.failed.push({
        endpoint: `${method} ${path}`,
        error: 'Request timeout',
        description
      });
      console.log(`  ❌ ${method} ${path} - Timeout`);
      resolve(false);
    });

    req.setTimeout(TIMEOUT);

    if (method === 'POST' || method === 'PUT') {
      req.write(JSON.stringify({}));
    }
    
    req.end();
  });
}

/**
 * Test server có chạy không
 */
async function testServerHealth() {
  console.log('\n🏥 Test Server Health...\n');
  
  try {
    await testEndpoint('GET', '/api/health', 'Health check endpoint', 200);
  } catch (error) {
    console.log('  ⚠️  Server có thể chưa chạy, bỏ qua test endpoints');
    testResults.skipped.push({
      reason: 'Server không chạy hoặc không thể kết nối',
      error: error.message
    });
    return false;
  }
  
  return true;
}

/**
 * Test Auth endpoints
 */
async function testAuthEndpoints() {
  console.log('\n🔐 Test Auth Endpoints...\n');
  
  // Test public endpoints
  await testEndpoint('GET', '/api/auth/faculties', 'Get faculties (public)', 'any');
  await testEndpoint('GET', '/api/auth/classes/CNTT', 'Get classes by faculty (public)', 'any');
  
  // Test protected endpoints (sẽ trả về 401 - expected)
  await testEndpoint('GET', '/api/auth/me', 'Get current user (protected)', 401);
  await testEndpoint('GET', '/api/auth/permissions', 'Get permissions (protected)', 401);
}

/**
 * Test Activities endpoints
 */
async function testActivitiesEndpoints() {
  console.log('\n📋 Test Activities Endpoints...\n');
  
  // Test protected endpoints (sẽ trả về 401 - expected)
  await testEndpoint('GET', '/api/core/activities', 'List activities (protected)', 401);
  await testEndpoint('GET', '/api/core/activities/00000000-0000-0000-0000-000000000000/qr-data', 'Get QR data (protected)', 401);
  await testEndpoint('GET', '/api/core/activities/00000000-0000-0000-0000-000000000000', 'Get activity by ID (protected)', 401);
}

/**
 * Test Users endpoints
 */
async function testUsersEndpoints() {
  console.log('\n👥 Test Users Endpoints...\n');
  
  // Test protected endpoints (sẽ trả về 401 - expected)
  await testEndpoint('GET', '/api/core/users', 'List users (protected)', 401);
  await testEndpoint('GET', '/api/core/users/me', 'Get current user profile (protected)', 401);
  await testEndpoint('GET', '/api/core/users/stats', 'Get user stats (protected)', 401);
}

/**
 * Test Semesters endpoints
 */
async function testSemestersEndpoints() {
  console.log('\n📅 Test Semesters Endpoints...\n');
  
  // Test protected endpoints (sẽ trả về 401 - expected)
  await testEndpoint('GET', '/api/semesters', 'List semesters (protected)', 401);
  await testEndpoint('GET', '/api/semesters/current', 'Get current semester (protected)', 401);
}

/**
 * Test Classes endpoints
 */
async function testClassesEndpoints() {
  console.log('\n🏫 Test Classes Endpoints...\n');
  
  // Test protected endpoints (sẽ trả về 401 - expected)
  await testEndpoint('GET', '/api/core/classes', 'List classes (protected)', 401);
}

/**
 * In kết quả
 */
function printResults() {
  console.log('\n' + '='.repeat(60));
  console.log('📊 KẾT QUẢ TEST ENDPOINTS');
  console.log('='.repeat(60));
  
  console.log(`\n✅ Passed: ${testResults.passed.length}`);
  testResults.passed.forEach(({ endpoint, status, description }) => {
    console.log(`  ✓ ${endpoint} - Status: ${status}${description ? ` (${description})` : ''}`);
  });
  
  if (testResults.skipped.length > 0) {
    console.log(`\n⏭️  Skipped: ${testResults.skipped.length}`);
    testResults.skipped.forEach(({ reason }) => {
      console.log(`  ⏭️  ${reason}`);
    });
  }
  
  if (testResults.failed.length > 0) {
    console.log(`\n❌ Failed: ${testResults.failed.length}`);
    testResults.failed.forEach(({ endpoint, expected, actual, error, description }) => {
      console.log(`  ✗ ${endpoint}${description ? ` (${description})` : ''}`);
      if (error) {
        console.log(`    Error: ${error}`);
      } else if (expected && actual) {
        console.log(`    Expected: ${expected}, Got: ${actual}`);
      }
    });
  }
  
  console.log('\n' + '='.repeat(60));
  
  if (testResults.failed.length === 0 && testResults.skipped.length === 0) {
    console.log('✅ TẤT CẢ ENDPOINT TEST ĐỀU PASS!');
    console.log('🎉 Server hoạt động bình thường!');
  } else if (testResults.skipped.length > 0 && testResults.failed.length === 0) {
    console.log('⚠️  Server có thể chưa chạy, nhưng không có lỗi runtime!');
    console.log('💡 Để test đầy đủ, vui lòng start server trước: npm start');
  } else {
    console.log('❌ CÓ LỖI XẢY RA!');
    console.log('⚠️  Vui lòng kiểm tra lại server và các endpoint.');
  }
}

/**
 * Chạy tất cả tests
 */
async function runTests() {
  console.log('🧪 Bắt đầu test các endpoint...');
  console.log(`📍 Base URL: ${BASE_URL}\n`);
  
  const serverRunning = await testServerHealth();
  
  if (serverRunning) {
    await testAuthEndpoints();
    await testActivitiesEndpoints();
    await testUsersEndpoints();
    await testSemestersEndpoints();
    await testClassesEndpoints();
  }
  
  printResults();
}

// Chạy tests
runTests().catch(error => {
  console.error('❌ Lỗi khi chạy test:', error);
  process.exit(1);
});

