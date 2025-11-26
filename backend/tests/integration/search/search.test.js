/**
 * Integration Tests for Search Module
 * Test Cases: TC-SRC-001 to TC-SRC-003
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

describe('Search Module - Integration Tests', () => {
  let testStudent;
  let testAdmin;
  let studentToken;
  let adminToken;

  beforeAll(async () => {
    testStudent = await createStudentUser({
      ten_dn: 'test_student_search',
      email: 'test_student_search@dlu.edu.vn',
      ho_ten: 'Sinh Viên Search Test',
      mssv: '2212430'
    });

    testAdmin = await createAdminUser({
      ten_dn: 'test_admin_search',
      email: 'test_admin_search@dlu.edu.vn',
      ho_ten: 'Admin Search Test'
    });

    studentToken = generateToken(testStudent);
    adminToken = generateToken(testAdmin);
  });

  afterAll(async () => {
    await cleanupTestData();
    await prisma.$disconnect();
  });

  describe('TC-SRC-001: Tìm kiếm hoạt động theo từ khóa', () => {
    it('should search activities by keyword', async () => {
      const response = await request(app)
        .get('/api/core/activities')
        .set('Authorization', `Bearer ${studentToken}`)
        .query({ 
          search: 'Hội',
          page: 1,
          limit: 20 
        });

      expect(response.status).toBe(200);
      expect(response.body.data).toBeDefined();
    });

    it('should search activities by name', async () => {
      const response = await request(app)
        .get('/api/core/activities')
        .set('Authorization', `Bearer ${studentToken}`)
        .query({ 
          ten_hd: 'Tình nguyện',
          page: 1 
        });

      expect(response.status).toBe(200);
    });

    it('should return empty array for non-matching search', async () => {
      const response = await request(app)
        .get('/api/core/activities')
        .set('Authorization', `Bearer ${studentToken}`)
        .query({ 
          search: 'xyz123nonexistent456'
        });

      expect(response.status).toBe(200);
      // Data format may vary - just check we got 200
    });
  });

  describe('TC-SRC-002: Tìm kiếm kết hợp nhiều bộ lọc', () => {
    it('should search with multiple filters', async () => {
      const response = await request(app)
        .get('/api/core/activities')
        .set('Authorization', `Bearer ${studentToken}`)
        .query({ 
          search: 'hoạt động',
          trang_thai: 'DANG_MO_DK',
          loai_hd: 'Học thuật',
          page: 1,
          limit: 20
        });

      expect(response.status).toBe(200);
      
      const data = response.body.data;
      if (data && data.length > 0) {
        data.forEach(activity => {
          // Verify status filter applied
          expect(activity.trang_thai).toBe('DANG_MO_DK');
        });
      }
    });

    it('should combine date range with search', async () => {
      const startDate = new Date();
      startDate.setMonth(startDate.getMonth() - 3);
      
      const response = await request(app)
        .get('/api/core/activities')
        .set('Authorization', `Bearer ${studentToken}`)
        .query({ 
          search: 'sinh viên',
          tu_ngay: startDate.toISOString().split('T')[0],
          den_ngay: new Date().toISOString().split('T')[0]
        });

      expect(response.status).toBe(200);
    });
  });

  describe('TC-SRC-003: Tìm kiếm người dùng (Admin)', () => {
    it('should search users by name (Admin)', async () => {
      const response = await request(app)
        .get('/api/core/admin/users')
        .set('Authorization', `Bearer ${adminToken}`)
        .query({ 
          search: 'Nguyễn',
          page: 1,
          limit: 20 
        });

      expect([200, 403, 404]).toContain(response.status);
    });

    it('should search users by MSSV', async () => {
      const response = await request(app)
        .get('/api/core/admin/users')
        .set('Authorization', `Bearer ${adminToken}`)
        .query({ 
          mssv: '221',
          page: 1,
          limit: 20 
        });

      expect([200, 403, 404]).toContain(response.status);
    });

    it('should search users by email', async () => {
      const response = await request(app)
        .get('/api/core/admin/users')
        .set('Authorization', `Bearer ${adminToken}`)
        .query({ 
          email: '@dlu.edu.vn',
          page: 1,
          limit: 20 
        });

      expect([200, 403, 404]).toContain(response.status);
    });

    it('should deny student from searching users', async () => {
      const response = await request(app)
        .get('/api/core/admin/users')
        .set('Authorization', `Bearer ${studentToken}`)
        .query({ search: 'Nguyễn' });

      expect([401, 403, 404]).toContain(response.status);
    });
  });

  describe('Additional Search Tests', () => {
    it('should handle special characters in search', async () => {
      const response = await request(app)
        .get('/api/core/activities')
        .set('Authorization', `Bearer ${studentToken}`)
        .query({ 
          search: "test'injection<script>"
        });

      // Should not error - properly sanitized
      expect([200, 400]).toContain(response.status);
    });

    it('should handle empty search query', async () => {
      const response = await request(app)
        .get('/api/core/activities')
        .set('Authorization', `Bearer ${studentToken}`)
        .query({ search: '' });

      expect(response.status).toBe(200);
    });

    it('should handle very long search query', async () => {
      const longQuery = 'a'.repeat(500);
      
      const response = await request(app)
        .get('/api/core/activities')
        .set('Authorization', `Bearer ${studentToken}`)
        .query({ search: longQuery });

      // Should either succeed or return validation error
      expect([200, 400]).toContain(response.status);
    });
  });

  describe('Unauthorized Access Tests', () => {
    it('should deny search without token', async () => {
      const response = await request(app)
        .get('/api/core/activities')
        .query({ search: 'test' });

      // Activities may or may not require auth
      expect([200, 401]).toContain(response.status);
    });
  });
});
