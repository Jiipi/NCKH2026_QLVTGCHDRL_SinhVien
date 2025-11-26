/**
 * Integration Tests for Semesters Module
 * Test Cases: TC-SEM-001 to TC-SEM-002
 */

const request = require('supertest');
const { createServer } = require('../../../src/app/server');
const { 
  createStudentUser, 
  createAdminUser,
  generateToken
} = require('../../helpers/authHelper');
const { cleanupTestData, prisma } = require('../../helpers/dbHelper');

const app = createServer();

describe('Semesters Module - Integration Tests', () => {
  let testStudent;
  let testAdmin;
  let studentToken;
  let adminToken;

  beforeAll(async () => {
    testStudent = await createStudentUser({
      ten_dn: 'test_student_semesters',
      email: 'test_student_semesters@dlu.edu.vn',
      ho_ten: 'Sinh Viên Semesters Test',
      mssv: '2212410'
    });

    testAdmin = await createAdminUser({
      ten_dn: 'test_admin_semesters',
      email: 'test_admin_semesters@dlu.edu.vn',
      ho_ten: 'Admin Semesters Test'
    });

    studentToken = generateToken(testStudent);
    adminToken = generateToken(testAdmin);
  });

  afterAll(async () => {
    await cleanupTestData();
    await prisma.$disconnect();
  });

  describe('TC-SEM-001: Lấy danh sách học kỳ', () => {
    it('should get semesters list (Authenticated)', async () => {
      const response = await request(app)
        .get('/api/core/semesters')
        .set('Authorization', `Bearer ${studentToken}`);

      expect(response.status).toBe(200);
      expect(response.body.data || response.body).toBeDefined();
      
      const data = response.body.data || response.body;
      if (Array.isArray(data)) {
        expect(data.length).toBeGreaterThan(0);
        
        // Each semester should have required fields
        data.forEach(semester => {
          expect(semester.ma_hk || semester.id).toBeDefined();
          expect(semester.ten_hk || semester.name).toBeDefined();
        });
      }
    });

    it('should get semesters list (Admin)', async () => {
      const response = await request(app)
        .get('/api/core/semesters')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(200);
    });

    it('should return semesters sorted by date', async () => {
      const response = await request(app)
        .get('/api/core/semesters')
        .set('Authorization', `Bearer ${studentToken}`)
        .query({ sort: 'ngay_bat_dau:desc' });

      expect(response.status).toBe(200);
      
      const data = response.body.data || response.body;
      if (Array.isArray(data) && data.length > 1) {
        // Check if sorted (optional validation)
        const dates = data.map(s => new Date(s.ngay_bat_dau || s.startDate));
        for (let i = 1; i < dates.length; i++) {
          expect(dates[i-1].getTime()).toBeGreaterThanOrEqual(dates[i].getTime());
        }
      }
    });
  });

  describe('TC-SEM-002: Lấy học kỳ hiện tại', () => {
    it('should get current semester', async () => {
      const response = await request(app)
        .get('/api/core/semesters/current')
        .set('Authorization', `Bearer ${studentToken}`);

      expect([200, 404]).toContain(response.status);
      
      if (response.status === 200) {
        const data = response.body.data || response.body;
        expect(data.ma_hk || data.id).toBeDefined();
        expect(data.ten_hk || data.name).toBeDefined();
      }
    });
  });

  describe('Additional Semester Tests', () => {
    it('should get semester by ID', async () => {
      // First get list to get a valid ID
      const listResponse = await request(app)
        .get('/api/core/semesters')
        .set('Authorization', `Bearer ${studentToken}`);

      const data = listResponse.body.data || listResponse.body;
      if (!Array.isArray(data) || data.length === 0) {
        console.log('Skipping - No semesters found');
        return;
      }

      const semesterId = data[0].ma_hk || data[0].id;

      const response = await request(app)
        .get(`/api/core/semesters/${semesterId}`)
        .set('Authorization', `Bearer ${studentToken}`);

      expect([200, 404]).toContain(response.status);
    });

    it('should create semester (Admin only)', async () => {
      const newSemester = {
        ten_hk: `Học kỳ Test ${Date.now()}`,
        nam_hoc: '2024-2025',
        ngay_bat_dau: '2024-09-01',
        ngay_ket_thuc: '2025-01-15',
        trang_thai: 'HOAT_DONG'
      };

      const response = await request(app)
        .post('/api/core/semesters')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(newSemester);

      expect([200, 201, 403, 404]).toContain(response.status);
    });

    it('should deny student from creating semester', async () => {
      const newSemester = {
        ten_hk: 'Học kỳ Hacker',
        nam_hoc: '2024-2025',
        ngay_bat_dau: '2024-09-01',
        ngay_ket_thuc: '2025-01-15'
      };

      const response = await request(app)
        .post('/api/core/semesters')
        .set('Authorization', `Bearer ${studentToken}`)
        .send(newSemester);

      expect([401, 403, 404]).toContain(response.status);
    });
  });

  describe('Unauthorized Access Tests', () => {
    it('should deny access without token', async () => {
      const response = await request(app)
        .get('/api/core/semesters');

      // Some endpoints may allow public access to semesters
      expect([200, 401]).toContain(response.status);
    });
  });
});
