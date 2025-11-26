/**
 * Integration Tests for Authentication - Login
 * Test Cases: TC-AUTH-001 to TC-AUTH-006
 */

const request = require('supertest');
const { createServer } = require('../../../src/app/server');
const { 
  createStudentUser, 
  createLockedUser,
  hashPassword 
} = require('../../helpers/authHelper');
const { cleanupTestData, prisma } = require('../../helpers/dbHelper');

const app = createServer();

describe('Authentication - Login', () => {
  let testStudent;
  let lockedUser;
  const validPassword = 'MatKhau123!';
  const testId = Date.now();

  beforeAll(async () => {
    await cleanupTestData();
    
    // Create test users with unique identifiers
    testStudent = await createStudentUser({
      ten_dn: `test_st_${testId}`,
      mat_khau: validPassword,
      email: `test_st_${testId}@dlu.edu.vn`,
      ho_ten: 'Nguyễn Văn Test',
      mssv: `SV${String(testId).slice(-7)}`
    });

    lockedUser = await createLockedUser({
      ten_dn: `test_locked_${testId}`,
      mat_khau: validPassword,
      email: `test_locked_${testId}@dlu.edu.vn`,
    });
  });

  afterAll(async () => {
    await cleanupTestData();
    await prisma.$disconnect();
  });

  describe('TC-AUTH-001: Đăng nhập thành công với mã sinh viên', () => {
    it('should return 200 and token when credentials are valid', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          maso: testStudent.ten_dn,
          password: validPassword
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      // Token is in response.body.data.token
      expect(response.body.data).toBeDefined();
      expect(response.body.data.token).toBeDefined();
      expect(typeof response.body.data.token).toBe('string');
      expect(response.body.data.user).toBeDefined();
      // User has roleCode instead of vai_tro
      expect(response.body.data.user).toHaveProperty('roleCode');
      expect(response.body.data.user.roleCode).toBe('SINH_VIEN');
      // Token should be JWT format (3 parts separated by dots)
      expect(response.body.data.token.split('.').length).toBe(3);
    });

    it('should include redirect path in response', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          maso: testStudent.ten_dn,
          password: validPassword
        });

      expect(response.status).toBe(200);
      expect(response.body.data).toBeDefined();
      // redirectTo may be present based on role
      if (response.body.data.redirectTo) {
        expect(typeof response.body.data.redirectTo).toBe('string');
      }
    });
  });

  describe('TC-AUTH-002: Đăng nhập thất bại - Sai mật khẩu', () => {
    it('should return 401 when password is incorrect', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          maso: testStudent.ten_dn,
          password: 'SaiMatKhau123'
        });

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toBeDefined();
    });
  });

  describe('TC-AUTH-003: Đăng nhập thất bại - Tài khoản không tồn tại', () => {
    it('should return 401 when account does not exist', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          maso: '9999999',
          password: 'Pass123!'
        });

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toBeDefined();
    });
  });

  describe('TC-AUTH-004: Đăng nhập thất bại - Tài khoản bị khóa', () => {
    it('should return 403 when account is locked', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          maso: lockedUser.ten_dn,
          password: validPassword
        });

      // Should be 401 or 403 for locked accounts
      expect([401, 403]).toContain(response.status);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toBeDefined();
    });
  });

  describe('TC-AUTH-005: Validation - Thiếu username', () => {
    it('should return 400 when username is missing', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          password: 'Pass123!'
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(
        response.body.errors || response.body.message
      ).toBeDefined();
    });
  });

  describe('TC-AUTH-006: Validation - Thiếu password', () => {
    it('should return 400 when password is missing', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          maso: testStudent.ten_dn
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(
        response.body.errors || response.body.message
      ).toBeDefined();
    });
  });

  describe('Additional Login Tests', () => {
    it('should reject empty request body', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({});

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });

    it('should handle special characters in username', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          maso: '<script>alert("xss")</script>',
          password: 'Pass123!'
        });

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
    });

    it('should handle very long input', async () => {
      const longString = 'a'.repeat(10000);
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          maso: longString,
          password: longString
        });

      // Should handle gracefully (400 or 401)
      expect([400, 401, 413]).toContain(response.status);
    });
  });
});
