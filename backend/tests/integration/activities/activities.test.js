/**
 * Integration Tests for Activities Module
 * Test Cases: TC-ACT-001 to TC-ACT-013
 */

const request = require('supertest');
const app = require('../../../src/app/server');
const { 
  createStudentUser, 
  createTeacherUser,
  createAdminUser,
  createMonitorUser,
  generateToken
} = require('../../helpers/authHelper');
const { 
  cleanupTestData, 
  createTestActivity,
  prisma 
} = require('../../helpers/dbHelper');

describe('Activities Module - Integration Tests', () => {
  let testStudent;
  let testTeacher;
  let testAdmin;
  let testMonitor;
  let studentToken;
  let teacherToken;
  let adminToken;
  let monitorToken;
  let testActivity;

  beforeAll(async () => {
    await cleanupTestData();
    
    // Create test users
    testAdmin = await createAdminUser({
      ten_dn: 'test_admin_act',
      email: 'test_admin_act@dlu.edu.vn',
    });
    
    testTeacher = await createTeacherUser({
      ten_dn: 'test_teacher_act',
      email: 'test_teacher_act@dlu.edu.vn',
    });

    testStudent = await createStudentUser({
      ten_dn: 'test_student_act',
      email: 'test_student_act@dlu.edu.vn',
      mssv: '2212345'
    });

    testMonitor = await createMonitorUser({
      ten_dn: 'test_monitor_act',
      email: 'test_monitor_act@dlu.edu.vn',
      mssv: '2212346'
    });

    adminToken = generateToken(testAdmin);
    teacherToken = generateToken(testTeacher);
    studentToken = generateToken(testStudent);
    monitorToken = generateToken(testMonitor);

    // Create test activities
    testActivity = await createTestActivity({
      ten_hd: 'Test Activity Main',
      trang_thai: 'da_duyet'
    }, testAdmin.id);
  });

  afterAll(async () => {
    await cleanupTestData();
    await prisma.$disconnect();
  });

  describe('TC-ACT-001: Lấy danh sách hoạt động thành công', () => {
    it('should return list of activities with pagination', async () => {
      const response = await request(app)
        .get('/api/core/activities')
        .set('Authorization', `Bearer ${studentToken}`)
        .query({ page: 1, limit: 20 });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeDefined();
      expect(Array.isArray(response.body.data)).toBe(true);
      
      // Check pagination
      if (response.body.pagination) {
        expect(response.body.pagination).toHaveProperty('page');
        expect(response.body.pagination).toHaveProperty('total');
      }
    });

    it('should work for teacher with different scope', async () => {
      const response = await request(app)
        .get('/api/core/activities')
        .set('Authorization', `Bearer ${teacherToken}`);

      expect(response.status).toBe(200);
      expect(response.body.data).toBeDefined();
    });
  });

  describe('TC-ACT-002: Lọc hoạt động theo trạng thái', () => {
    beforeAll(async () => {
      await createTestActivity({ 
        ten_hd: 'Test Pending Activity',
        trang_thai: 'cho_duyet' 
      }, testAdmin.id);
    });

    it('should filter activities by status', async () => {
      const response = await request(app)
        .get('/api/core/activities')
        .set('Authorization', `Bearer ${studentToken}`)
        .query({ status: 'da_duyet' });

      expect(response.status).toBe(200);
      expect(response.body.data).toBeDefined();
      
      // All returned activities should have status 'da_duyet'
      if (response.body.data.length > 0) {
        response.body.data.forEach(activity => {
          expect(activity.trang_thai).toBe('da_duyet');
        });
      }
    });
  });

  describe('TC-ACT-003: Tìm kiếm hoạt động theo từ khóa', () => {
    beforeAll(async () => {
      await createTestActivity({ 
        ten_hd: 'Test Hội thảo AI 2025',
        mo_ta: 'Tìm hiểu về trí tuệ nhân tạo'
      }, testAdmin.id);
    });

    it('should search activities by keyword', async () => {
      const response = await request(app)
        .get('/api/core/activities')
        .set('Authorization', `Bearer ${studentToken}`)
        .query({ search: 'hội thảo' });

      expect(response.status).toBe(200);
      expect(response.body.data).toBeDefined();
      
      // Should find the activity with "hội thảo" in name
      if (response.body.data.length > 0) {
        const found = response.body.data.some(a => 
          a.ten_hd?.toLowerCase().includes('hội thảo') ||
          a.mo_ta?.toLowerCase().includes('hội thảo')
        );
        expect(found).toBe(true);
      }
    });
  });

  describe('TC-ACT-005: Lọc theo học kỳ và năm học', () => {
    it('should filter by semester', async () => {
      const response = await request(app)
        .get('/api/core/activities')
        .set('Authorization', `Bearer ${studentToken}`)
        .query({ 
          semester: 'hoc_ky_1-2024' // or semesterValue format
        });

      expect(response.status).toBe(200);
      expect(response.body.data).toBeDefined();
    });
  });

  describe('TC-ACT-006: Unauthorized - Không có token', () => {
    it('should return 401 without token', async () => {
      const response = await request(app)
        .get('/api/core/activities');

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
    });
  });

  describe('TC-ACT-007: Lấy chi tiết hoạt động thành công', () => {
    it('should return activity details by ID', async () => {
      const response = await request(app)
        .get(`/api/core/activities/${testActivity.id}`)
        .set('Authorization', `Bearer ${studentToken}`);

      expect(response.status).toBe(200);
      expect(response.body.data || response.body).toBeDefined();
      
      const activity = response.body.data || response.body;
      expect(activity.id).toBe(testActivity.id);
      expect(activity.ten_hd).toBeDefined();
    });
  });

  describe('TC-ACT-008: Hoạt động không tồn tại', () => {
    it('should return 404 for non-existent activity', async () => {
      const fakeId = '00000000-0000-0000-0000-000000000000';
      
      const response = await request(app)
        .get(`/api/core/activities/${fakeId}`)
        .set('Authorization', `Bearer ${studentToken}`);

      expect(response.status).toBe(404);
      expect(response.body.success).toBe(false);
    });

    it('should return 400 for invalid ID format', async () => {
      const response = await request(app)
        .get('/api/core/activities/invalid-id')
        .set('Authorization', `Bearer ${studentToken}`);

      expect([400, 404]).toContain(response.status);
    });
  });

  describe('TC-ACT-010: Tạo hoạt động mới thành công (Lớp trưởng)', () => {
    let loaiHD;

    beforeAll(async () => {
      loaiHD = await prisma.loaiHoatDong.findFirst();
      if (!loaiHD) {
        loaiHD = await prisma.loaiHoatDong.create({
          data: {
            ten_loai_hd: 'Test Type Create',
            mo_ta: 'For creation test',
            diem_rl_toi_da: 10,
          }
        });
      }
    });

    it('should allow monitor to create activity', async () => {
      const activityData = {
        ten_hoat_dong: 'Test New Activity by Monitor',
        mo_ta: 'Hoạt động test tạo mới',
        loai_hoat_dong_id: loaiHD.id,
        diem_ren_luyen: 5,
        dia_diem: 'Phòng E101',
        ngay_bat_dau: new Date(Date.now() + 86400000).toISOString(),
        ngay_ket_thuc: new Date(Date.now() + 172800000).toISOString(),
        so_luong_toi_da: 50,
      };

      const response = await request(app)
        .post('/api/core/activities')
        .set('Authorization', `Bearer ${monitorToken}`)
        .send(activityData);

      // Monitor should be able to create
      expect([200, 201]).toContain(response.status);
      
      if (response.status === 201 || response.status === 200) {
        expect(response.body.data || response.body).toBeDefined();
      }
    });
  });

  describe('TC-ACT-011: Tạo hoạt động thất bại - Thiếu field bắt buộc', () => {
    it('should reject when missing required fields', async () => {
      const invalidData = {
        // Missing required fields like ten_hd, loai_hd_id
        mo_ta: 'Only description'
      };

      const response = await request(app)
        .post('/api/core/activities')
        .set('Authorization', `Bearer ${monitorToken}`)
        .send(invalidData);

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });
  });

  describe('Pagination Tests', () => {
    beforeAll(async () => {
      // Create multiple activities for pagination test
      for (let i = 0; i < 5; i++) {
        await createTestActivity({
          ten_hd: `Test Pagination Activity ${i}`,
          trang_thai: 'da_duyet'
        }, testAdmin.id);
      }
    });

    it('should respect limit parameter', async () => {
      const response = await request(app)
        .get('/api/core/activities')
        .set('Authorization', `Bearer ${studentToken}`)
        .query({ page: 1, limit: 3 });

      expect(response.status).toBe(200);
      expect(response.body.data.length).toBeLessThanOrEqual(3);
    });

    it('should handle page parameter', async () => {
      const page1 = await request(app)
        .get('/api/core/activities')
        .set('Authorization', `Bearer ${studentToken}`)
        .query({ page: 1, limit: 2 });

      const page2 = await request(app)
        .get('/api/core/activities')
        .set('Authorization', `Bearer ${studentToken}`)
        .query({ page: 2, limit: 2 });

      expect(page1.status).toBe(200);
      expect(page2.status).toBe(200);
      
      // Page 1 and 2 should have different data (if enough records)
      if (page1.body.data.length > 0 && page2.body.data.length > 0) {
        expect(page1.body.data[0].id).not.toBe(page2.body.data[0].id);
      }
    });
  });
});
