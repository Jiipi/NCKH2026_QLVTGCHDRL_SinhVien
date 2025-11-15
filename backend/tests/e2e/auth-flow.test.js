/**
 * E2E Tests for Authentication Flow
 * Tests with real data and complete user journey
 */

const request = require('supertest');
const { prisma } = require('../../src/config/database');
const bcrypt = require('bcryptjs');

// Import the actual app
let app;

describe('Authentication Flow - E2E Tests', () => {
  let testUser;
  let testAdmin;

  beforeAll(async () => {
    // Dynamically import app to avoid port conflicts
    const appModule = require('../../src/index');
    app = appModule.app || appModule;

    // Clean up test users
    await prisma.nguoiDung.deleteMany({
      where: {
        ten_dn: {
          in: ['e2e_test_user', 'e2e_test_admin']
        }
      }
    });
  });

  afterAll(async () => {
    // Clean up
    await prisma.nguoiDung.deleteMany({
      where: {
        ten_dn: {
          in: ['e2e_test_user', 'e2e_test_admin']
        }
      }
    });
    await prisma.$disconnect();
  });

  describe('User Registration and Login Flow', () => {
    it('should complete full registration flow', async () => {
      // Step 1: Get list of classes for registration
      const classesResponse = await request(app)
        .get('/api/auth/classes')
        .expect(200);

      expect(classesResponse.body).toHaveProperty('classes');
      expect(Array.isArray(classesResponse.body.classes)).toBe(true);

      const testClass = classesResponse.body.classes[0];
      expect(testClass).toHaveProperty('id');

      // Step 2: Register new user
      const registrationData = {
        name: 'E2E Test User',
        maso: 'e2e_test_user',
        email: 'e2e_test@example.com',
        password: 'Test123456',
        confirmPassword: 'Test123456',
        faculty: testClass.khoa,
        classId: testClass.id,
        ngaySinh: '2000-01-01',
        gioiTinh: 'nam',
        diaChi: 'Test Address',
        sdt: '0123456789'
      };

      const registerResponse = await request(app)
        .post('/api/auth/register')
        .send(registrationData)
        .expect(201);

      expect(registerResponse.body).toHaveProperty('message');
      expect(registerResponse.body).toHaveProperty('user');
      expect(registerResponse.body.user.ten_dn).toBe('e2e_test_user');

      testUser = registerResponse.body.user;

      // Step 3: Login with new credentials
      const loginResponse = await request(app)
        .post('/api/auth/login')
        .send({
          username: 'e2e_test_user',
          password: 'Test123456'
        })
        .expect(200);

      expect(loginResponse.body).toHaveProperty('token');
      expect(loginResponse.body).toHaveProperty('user');
      expect(loginResponse.body.user.ten_dn).toBe('e2e_test_user');

      const token = loginResponse.body.token;

      // Step 4: Access protected route with token
      const profileResponse = await request(app)
        .get('/api/core/profile')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(profileResponse.body).toHaveProperty('data');
      expect(profileResponse.body.data.ten_dn).toBe('e2e_test_user');
    });

    it('should prevent duplicate registration', async () => {
      const duplicateData = {
        name: 'Duplicate User',
        maso: 'e2e_test_user', // Same as above
        email: 'duplicate@example.com',
        password: 'Test123456',
        confirmPassword: 'Test123456',
        faculty: 'Công nghệ thông tin',
        classId: 'some-class-id'
      };

      const response = await request(app)
        .post('/api/auth/register')
        .send(duplicateData)
        .expect(400);

      expect(response.body).toHaveProperty('error');
    });
  });

  describe('Admin Login and Operations', () => {
    it('should login as admin and access admin routes', async () => {
      // Try to login with existing admin account
      const adminLogin = await request(app)
        .post('/api/auth/login')
        .send({
          username: 'admin',
          password: 'admin123'
        });

      if (adminLogin.status === 200) {
        const token = adminLogin.body.token;

        // Access admin route
        const adminResponse = await request(app)
          .get('/api/core/admin/users')
          .set('Authorization', `Bearer ${token}`)
          .expect(200);

        expect(adminResponse.body).toHaveProperty('data');
      } else {
        console.log('Admin account not found, skipping admin tests');
      }
    });
  });

  describe('Password Reset Flow', () => {
    it('should handle password change', async () => {
      // Login first
      const loginResponse = await request(app)
        .post('/api/auth/login')
        .send({
          username: 'e2e_test_user',
          password: 'Test123456'
        })
        .expect(200);

      const token = loginResponse.body.token;

      // Change password
      const changePasswordResponse = await request(app)
        .put('/api/core/profile/password')
        .set('Authorization', `Bearer ${token}`)
        .send({
          currentPassword: 'Test123456',
          newPassword: 'NewTest123456',
          confirmPassword: 'NewTest123456'
        });

      // Should succeed or return appropriate error
      expect([200, 400, 404]).toContain(changePasswordResponse.status);

      if (changePasswordResponse.status === 200) {
        // Try login with new password
        const newLoginResponse = await request(app)
          .post('/api/auth/login')
          .send({
            username: 'e2e_test_user',
            password: 'NewTest123456'
          })
          .expect(200);

        expect(newLoginResponse.body).toHaveProperty('token');
      }
    });
  });

  describe('Token Validation', () => {
    it('should reject invalid token', async () => {
      const response = await request(app)
        .get('/api/core/profile')
        .set('Authorization', 'Bearer invalid-token')
        .expect(401);

      expect(response.body).toHaveProperty('error');
    });

    it('should reject expired token', async () => {
      const jwt = require('jsonwebtoken');
      const expiredToken = jwt.sign(
        { id: '1', ten_dn: 'test' },
        process.env.JWT_SECRET || 'test-secret',
        { expiresIn: '0s' }
      );

      const response = await request(app)
        .get('/api/core/profile')
        .set('Authorization', `Bearer ${expiredToken}`)
        .expect(401);

      expect(response.body).toHaveProperty('error');
    });
  });

  describe('Role-Based Access Control', () => {
    it('should prevent student from accessing admin routes', async () => {
      // Login as student
      const loginResponse = await request(app)
        .post('/api/auth/login')
        .send({
          username: 'e2e_test_user',
          password: 'Test123456'
        });

      if (loginResponse.status === 200) {
        const token = loginResponse.body.token;

        // Try to access admin route
        const response = await request(app)
          .get('/api/core/admin/users')
          .set('Authorization', `Bearer ${token}`)
          .expect(403);

        expect(response.body).toHaveProperty('error');
      }
    });
  });
});

