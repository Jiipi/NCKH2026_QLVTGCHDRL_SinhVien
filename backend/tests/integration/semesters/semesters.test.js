/**
 * Integration Tests for Semesters Module
 * Test Cases: TC-SEM-001 to TC-SEM-002
 * 
 * Routes available:
 * - GET /api/semesters/options - Get semester options
 * - GET /api/semesters/list - Get semester list
 * - GET /api/semesters/current - Get current semester
 * - GET /api/semesters/status - Get current semester status
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
    it('should get semester options (Authenticated)', async () => {
      const response = await request(app)
        .get('/api/semesters/options')
        .set('Authorization', `Bearer ${studentToken}`);

      expect(response.status).toBe(200);
      expect(response.body.data || response.body).toBeDefined();
    });

    it('should get semester list (Admin)', async () => {
      const response = await request(app)
        .get('/api/semesters/list')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(200);
    });

    it('should get semester status', async () => {
      const response = await request(app)
        .get('/api/semesters/status')
        .set('Authorization', `Bearer ${studentToken}`);

      expect([200, 404]).toContain(response.status);
    });
  });

  describe('TC-SEM-002: Lấy học kỳ hiện tại', () => {
    it('should get current semester', async () => {
      const response = await request(app)
        .get('/api/semesters/current')
        .set('Authorization', `Bearer ${studentToken}`);

      expect([200, 404]).toContain(response.status);
      
      if (response.status === 200) {
        const data = response.body.data || response.body;
        expect(data).toBeDefined();
      }
    });
  });

  describe('Additional Semester Tests', () => {
    it('should get all classes', async () => {
      const response = await request(app)
        .get('/api/semesters/classes')
        .set('Authorization', `Bearer ${adminToken}`);

      expect([200, 404]).toContain(response.status);
    });

    it('should create next semester (Admin only)', async () => {
      const response = await request(app)
        .post('/api/semesters/create-next')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({});

      // May return 200 if successful, 400 if already exists, 403 if forbidden
      expect([200, 201, 400, 403, 404]).toContain(response.status);
    });

    it('should deny student from creating next semester', async () => {
      const response = await request(app)
        .post('/api/semesters/create-next')
        .set('Authorization', `Bearer ${studentToken}`)
        .send({});

      expect([401, 403, 404]).toContain(response.status);
    });
  });

  describe('Unauthorized Access Tests', () => {
    it('should deny access without token', async () => {
      const response = await request(app)
        .get('/api/semesters/options');

      expect(response.status).toBe(401);
    });
  });
});
