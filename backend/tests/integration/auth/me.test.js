/**
 * Integration Tests for Authentication - Me (Current User)
 * Test Cases: TC-AUTH-011
 */

const request = require('supertest');
const { createServer } = require('../../../src/app/server');
const { 
  createStudentUser, 
  createTeacherUser,
  createAdminUser,
  generateToken,
  generateExpiredToken,
  generateInvalidToken
} = require('../../helpers/authHelper');
const { cleanupTestData, prisma } = require('../../helpers/dbHelper');

const app = createServer();

describe('Authentication - Get Current User (GET /me)', () => {
  let testStudent;
  let testTeacher;
  let testAdmin;
  let studentToken;
  let teacherToken;
  let adminToken;

  beforeAll(async () => {
    await cleanupTestData();
    
    // Create test users
    testStudent = await createStudentUser({
      ten_dn: 'test_student_me',
      mat_khau: 'Test123!',
      email: 'test_student_me@dlu.edu.vn',
      ho_ten: 'Sinh Viên Test',
      mssv: '2212345'
    });

    testTeacher = await createTeacherUser({
      ten_dn: 'test_teacher_me',
      mat_khau: 'Test123!',
      email: 'test_teacher_me@dlu.edu.vn',
      ho_ten: 'Giảng Viên Test'
    });

    testAdmin = await createAdminUser({
      ten_dn: 'test_admin_me',
      mat_khau: 'Test123!',
      email: 'test_admin_me@dlu.edu.vn',
      ho_ten: 'Admin Test'
    });

    studentToken = generateToken(testStudent);
    teacherToken = generateToken(testTeacher);
    adminToken = generateToken(testAdmin);
  });

  afterAll(async () => {
    await cleanupTestData();
    await prisma.$disconnect();
  });

  describe('TC-AUTH-011: Lấy thông tin user hiện tại (GET /me)', () => {
    it('should return current user info for student', async () => {
      const response = await request(app)
        .get('/api/auth/me')
        .set('Authorization', `Bearer ${studentToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeDefined();
      
      const user = response.body.data;
      // API returns maso instead of ten_dn (mapped in toUserDTO)
      expect(user.maso).toBeDefined();
      expect(user.email).toBeDefined();
      expect(user.ho_ten).toBeDefined();
      expect(user.roleCode).toBeDefined();
      
      // Should NOT return password
      expect(user.mat_khau).toBeUndefined();
      expect(user.password).toBeUndefined();
    });

    it('should return current user info for teacher', async () => {
      const response = await request(app)
        .get('/api/auth/me')
        .set('Authorization', `Bearer ${teacherToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      
      const user = response.body.data;
      expect(user.maso).toBeDefined();
      expect(user.roleCode).toBe('GIANG_VIEN');
    });

    it('should return current user info for admin', async () => {
      const response = await request(app)
        .get('/api/auth/me')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      
      const user = response.body.data;
      expect(user.maso).toBeDefined();
      expect(user.roleCode).toBe('ADMIN');
    });

    it('should include student info for student role', async () => {
      const response = await request(app)
        .get('/api/auth/me')
        .set('Authorization', `Bearer ${studentToken}`);

      expect(response.status).toBe(200);
      
      const user = response.body.data;
      // Student should have SINH_VIEN role
      expect(user.roleCode).toBe('SINH_VIEN');
    });
  });

  describe('Unauthorized Access Tests', () => {
    it('should return 401 without token', async () => {
      const response = await request(app)
        .get('/api/auth/me');

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
    });

    it('should return 401 with invalid token', async () => {
      const response = await request(app)
        .get('/api/auth/me')
        .set('Authorization', `Bearer ${generateInvalidToken()}`);

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
    });

    it('should return 401 with expired token', async () => {
      const expiredToken = generateExpiredToken(testStudent);
      
      const response = await request(app)
        .get('/api/auth/me')
        .set('Authorization', `Bearer ${expiredToken}`);

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
    });

    it('should return 401 with malformed Authorization header', async () => {
      const response = await request(app)
        .get('/api/auth/me')
        .set('Authorization', 'NotBearerToken');

      expect(response.status).toBe(401);
    });
  });
});
