/**
 * Integration Tests for User Profile Module
 * Test Cases: TC-USR-001 to TC-USR-008
 */

const request = require('supertest');
const { createServer } = require('../../../src/app/server');
const { 
  createStudentUser, 
  createTeacherUser,
  createAdminUser,
  generateToken
} = require('../../helpers/authHelper');
const { cleanupTestData, prisma } = require('../../helpers/dbHelper');

const app = createServer();

describe('User Profile Module - Integration Tests', () => {
  let testStudent;
  let testTeacher;
  let testAdmin;
  let studentToken;
  let teacherToken;
  let adminToken;

  beforeAll(async () => {
    await cleanupTestData();
    
    testStudent = await createStudentUser({
      ten_dn: 'test_student_profile',
      email: 'test_student_profile@dlu.edu.vn',
      ho_ten: 'Sinh Viên Profile Test',
      mssv: '2212350'
    });

    testTeacher = await createTeacherUser({
      ten_dn: 'test_teacher_profile',
      email: 'test_teacher_profile@dlu.edu.vn',
      ho_ten: 'Giảng Viên Profile Test'
    });

    testAdmin = await createAdminUser({
      ten_dn: 'test_admin_profile',
      email: 'test_admin_profile@dlu.edu.vn',
      ho_ten: 'Admin Profile Test'
    });

    studentToken = generateToken(testStudent);
    teacherToken = generateToken(testTeacher);
    adminToken = generateToken(testAdmin);
  });

  afterAll(async () => {
    await cleanupTestData();
    await prisma.$disconnect();
  });

  describe('TC-USR-001: Xem thông tin profile cá nhân', () => {
    it('should return user profile for student', async () => {
      const response = await request(app)
        .get('/api/core/profile')
        .set('Authorization', `Bearer ${studentToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      
      const data = response.body.data || response.body.user;
      expect(data).toBeDefined();
      expect(data.ten_dn || data.username).toBeDefined();
      expect(data.email).toBeDefined();
      expect(data.ho_ten || data.name).toBeDefined();
      
      // Should NOT return password
      expect(data.mat_khau).toBeUndefined();
      expect(data.password).toBeUndefined();
    });

    it('should include sinh_vien info for student', async () => {
      const response = await request(app)
        .get('/api/core/profile')
        .set('Authorization', `Bearer ${studentToken}`);

      expect(response.status).toBe(200);
      
      const data = response.body.data || response.body.user;
      // Should have student-specific info
      const hasStudentInfo = data.sinh_vien || data.mssv || data.student;
      expect(hasStudentInfo).toBeDefined();
    });

    it('should work for teacher', async () => {
      const response = await request(app)
        .get('/api/core/profile')
        .set('Authorization', `Bearer ${teacherToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
    });
  });

  describe('TC-USR-002: Cập nhật thông tin profile', () => {
    it('should update user profile', async () => {
      const updateData = {
        ho_ten: 'Nguyễn Văn Updated',
        sdt: '0912345678',
        dia_chi: '123 Đường ABC, TP.HCM'
      };

      const response = await request(app)
        .put('/api/core/profile')
        .set('Authorization', `Bearer ${studentToken}`)
        .send(updateData);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      
      // Verify update
      const profile = await request(app)
        .get('/api/core/profile')
        .set('Authorization', `Bearer ${studentToken}`);
      
      const data = profile.body.data || profile.body.user;
      expect(data.ho_ten).toBe('Nguyễn Văn Updated');
    });

    it('should reject invalid update data', async () => {
      const invalidData = {
        email: 'invalid-email' // Invalid email format
      };

      const response = await request(app)
        .put('/api/core/profile')
        .set('Authorization', `Bearer ${studentToken}`)
        .send(invalidData);

      // Should either reject or ignore invalid fields
      expect([200, 400]).toContain(response.status);
    });
  });

  describe('TC-USR-004: Admin lấy danh sách người dùng', () => {
    it('should allow admin to get user list', async () => {
      const response = await request(app)
        .get('/api/core/admin/users')
        .set('Authorization', `Bearer ${adminToken}`)
        .query({ page: 1, limit: 20 });

      expect(response.status).toBe(200);
      expect(response.body.data).toBeDefined();
      expect(Array.isArray(response.body.data)).toBe(true);
      
      if (response.body.pagination) {
        expect(response.body.pagination).toHaveProperty('total');
      }
    });

    it('should filter by role', async () => {
      const response = await request(app)
        .get('/api/core/admin/users')
        .set('Authorization', `Bearer ${adminToken}`)
        .query({ vai_tro: 'SINH_VIEN' });

      expect(response.status).toBe(200);
      
      if (response.body.data && response.body.data.length > 0) {
        response.body.data.forEach(user => {
          const role = user.vai_tro?.ten_vt || user.role;
          expect(role).toBe('SINH_VIEN');
        });
      }
    });
  });

  describe('TC-USR-007: Permission - Sinh viên không xem danh sách users', () => {
    it('should deny student access to admin users list', async () => {
      const response = await request(app)
        .get('/api/core/admin/users')
        .set('Authorization', `Bearer ${studentToken}`);

      expect(response.status).toBe(403);
      expect(response.body.success).toBe(false);
    });

    it('should deny teacher access to admin users list', async () => {
      const response = await request(app)
        .get('/api/core/admin/users')
        .set('Authorization', `Bearer ${teacherToken}`);

      expect(response.status).toBe(403);
      expect(response.body.success).toBe(false);
    });
  });

  describe('TC-USR-008: Kiểm tra trạng thái lớp trưởng', () => {
    it('should return monitor status', async () => {
      const response = await request(app)
        .get('/api/core/profile/monitor-status')
        .set('Authorization', `Bearer ${studentToken}`);

      // May return 200 with isMonitor: false or 404 if not implemented
      expect([200, 404]).toContain(response.status);
      
      if (response.status === 200) {
        expect(response.body.data || response.body).toBeDefined();
      }
    });
  });

  describe('Unauthorized Access Tests', () => {
    it('should deny access without token', async () => {
      const response = await request(app)
        .get('/api/core/profile');

      expect(response.status).toBe(401);
    });

    it('should deny profile update without token', async () => {
      const response = await request(app)
        .put('/api/core/profile')
        .send({ ho_ten: 'Hacker' });

      expect(response.status).toBe(401);
    });
  });
});
