/**
 * Script test endpoints của Admin Dashboard
 * Kiểm tra trực tiếp API responses
 * 
 * Usage: node backend/scripts/test_admin_endpoints.js
 */

const axios = require('axios');

const BASE_URL = 'http://localhost:5000/api/v2';

// Mock token - replace with real token from login
let AUTH_TOKEN = '';

async function testAdminEndpoints() {
  console.log('='.repeat(80));
  console.log('🧪 TEST ADMIN DASHBOARD ENDPOINTS');
  console.log('='.repeat(80));
  console.log();

  // Get token from login first
  console.log('🔐 Đăng nhập admin...');
  try {
    const loginResponse = await axios.post(`${BASE_URL}/core/auth/login`, {
      ten_dn: 'admin',
      mat_khau: 'admin123'
    });
    AUTH_TOKEN = loginResponse.data.token;
    console.log('✅ Đăng nhập thành công');
    console.log();
  } catch (error) {
    console.log('⚠️  Không thể đăng nhập, sẽ test không có token');
    console.log();
  }

  const headers = AUTH_TOKEN ? { Authorization: `Bearer ${AUTH_TOKEN}` } : {};

  try {
    // 1. Test Dashboard Stats
    console.log('1️⃣  TEST DASHBOARD STATS');
    console.log('-'.repeat(80));
    try {
      const statsResponse = await axios.get(`${BASE_URL}/core/dashboard/admin`, { headers });
      console.log('✅ GET /core/dashboard/admin');
      console.log('Response:', JSON.stringify(statsResponse.data, null, 2));
      console.log();
    } catch (error) {
      console.log('❌ GET /core/dashboard/admin FAILED');
      console.log('Error:', error.response?.data || error.message);
      console.log();
    }

    // 2. Test Semesters List
    console.log('2️⃣  TEST SEMESTERS LIST');
    console.log('-'.repeat(80));
    try {
      const semestersResponse = await axios.get(`${BASE_URL}/semesters/list`, { headers });
      console.log('✅ GET /semesters/list');
      const semesters = Array.isArray(semestersResponse.data) ? semestersResponse.data : 
                        semestersResponse.data.data || semestersResponse.data.items || [];
      console.log(`Found ${semesters.length} semesters`);
      if (semesters.length > 0) {
        console.log('First semester:', JSON.stringify(semesters[0], null, 2));
      }
      console.log();
    } catch (error) {
      console.log('❌ GET /semesters/list FAILED');
      console.log('Error:', error.response?.data || error.message);
      console.log();
    }

    // 3. Test Registrations (Pending)
    console.log('3️⃣  TEST REGISTRATIONS (Pending)');
    console.log('-'.repeat(80));
    try {
      const regsResponse = await axios.get(`${BASE_URL}/core/admin/registrations?status=cho_duyet&limit=10`, { headers });
      console.log('✅ GET /core/admin/registrations?status=cho_duyet&limit=10');
      const registrations = regsResponse.data.items || regsResponse.data.data || regsResponse.data;
      console.log(`Found ${Array.isArray(registrations) ? registrations.length : 0} pending registrations`);
      if (Array.isArray(registrations) && registrations.length > 0) {
        console.log('First registration:', JSON.stringify(registrations[0], null, 2));
      }
      console.log();
    } catch (error) {
      console.log('❌ GET /core/admin/registrations FAILED');
      console.log('Error:', error.response?.data || error.message);
      console.log();
    }

    // 4. Test Recent Registrations (All statuses)
    console.log('4️⃣  TEST RECENT REGISTRATIONS (Recent Activity)');
    console.log('-'.repeat(80));
    try {
      const recentResponse = await axios.get(`${BASE_URL}/core/admin/registrations?limit=10`, { headers });
      console.log('✅ GET /core/admin/registrations?limit=10');
      const recent = recentResponse.data.items || recentResponse.data.data || recentResponse.data;
      console.log(`Found ${Array.isArray(recent) ? recent.length : 0} recent registrations`);
      if (Array.isArray(recent) && recent.length > 0) {
        console.log('First registration:', JSON.stringify(recent[0], null, 2));
      }
      console.log();
    } catch (error) {
      console.log('❌ GET /core/admin/registrations (recent) FAILED');
      console.log('Error:', error.response?.data || error.message);
      console.log();
    }

    // 5. Test Classes List
    console.log('5️⃣  TEST CLASSES LIST');
    console.log('-'.repeat(80));
    try {
      const classesResponse = await axios.get(`${BASE_URL}/semesters/classes`, { headers });
      console.log('✅ GET /semesters/classes');
      const classes = Array.isArray(classesResponse.data) ? classesResponse.data : 
                     classesResponse.data.data || classesResponse.data.items || [];
      console.log(`Found ${classes.length} classes`);
      if (classes.length > 0) {
        console.log('First class:', JSON.stringify(classes[0], null, 2));
      }
      console.log();
    } catch (error) {
      console.log('❌ GET /semesters/classes FAILED');
      console.log('Error:', error.response?.data || error.message);
      console.log();
    }

    // 6. Test Teachers List
    console.log('6️⃣  TEST TEACHERS LIST');
    console.log('-'.repeat(80));
    try {
      const teachersResponse = await axios.get(`${BASE_URL}/core/users?role=GIANG_VIEN&limit=10`, { headers });
      console.log('✅ GET /core/users?role=GIANG_VIEN&limit=10');
      const teachers = Array.isArray(teachersResponse.data) ? teachersResponse.data : 
                      teachersResponse.data.data || teachersResponse.data.items || [];
      console.log(`Found ${teachers.length} teachers`);
      if (teachers.length > 0) {
        console.log('First teacher:', JSON.stringify(teachers[0], null, 2));
      }
      console.log();
    } catch (error) {
      console.log('❌ GET /core/users?role=GIANG_VIEN FAILED');
      console.log('Error:', error.response?.data || error.message);
      console.log();
    }

    console.log('='.repeat(80));
    console.log('✅ HOÀN THÀNH KIỂM TRA ENDPOINTS');
    console.log('='.repeat(80));

  } catch (error) {
    console.error('❌ LỖI CHUNG:', error.message);
  }
}

// Run the tests
console.log('⚠️  LƯU Ý: Backend phải đang chạy tại http://localhost:5000');
console.log('⚠️  Có thể chỉnh BASE_URL nếu backend chạy ở port khác');
console.log();

testAdminEndpoints()
  .catch(console.error);
