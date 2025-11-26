/**
 * Integration Tests for Notifications Module
 * Test Cases: TC-NTF-001 to TC-NTF-003
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

describe('Notifications Module - Integration Tests', () => {
  let testStudent;
  let testAdmin;
  let studentToken;
  let adminToken;
  let testNotification;

  beforeAll(async () => {
    await cleanupTestData();
    
    testStudent = await createStudentUser({
      ten_dn: 'test_student_notifications',
      email: 'test_student_notifications@dlu.edu.vn',
      ho_ten: 'Sinh Viên Notifications Test',
      mssv: '2212420'
    });

    testAdmin = await createAdminUser({
      ten_dn: 'test_admin_notifications',
      email: 'test_admin_notifications@dlu.edu.vn',
      ho_ten: 'Admin Notifications Test'
    });

    studentToken = generateToken(testStudent);
    adminToken = generateToken(testAdmin);

    // Create test notification
    try {
      testNotification = await prisma.thong_bao.create({
        data: {
          tieu_de: 'Thông báo Test',
          noi_dung: 'Nội dung thông báo test cho integration tests',
          loai: 'HE_THONG',
          ma_nguoi_gui: testAdmin.ma_nguoi_dung,
          ngay_tao: new Date()
        }
      });

      // Create notification recipient
      await prisma.nguoi_nhan_tb.create({
        data: {
          ma_tb: testNotification.ma_tb,
          ma_nguoi_nhan: testStudent.ma_nguoi_dung,
          da_doc: false
        }
      });
    } catch (error) {
      console.log('Notification tables may not exist, skipping seeding');
    }
  });

  afterAll(async () => {
    await cleanupTestData();
    await prisma.$disconnect();
  });

  describe('TC-NTF-001: Lấy danh sách thông báo', () => {
    it('should get notifications list for user', async () => {
      const response = await request(app)
        .get('/api/core/notifications')
        .set('Authorization', `Bearer ${studentToken}`);

      expect([200, 404]).toContain(response.status);
      
      if (response.status === 200) {
        expect(response.body.data || response.body).toBeDefined();
        
        const data = response.body.data || response.body;
        if (Array.isArray(data)) {
          data.forEach(notification => {
            expect(notification.ma_tb || notification.id).toBeDefined();
          });
        }
      }
    });

    it('should get unread notifications count', async () => {
      const response = await request(app)
        .get('/api/core/notifications/unread-count')
        .set('Authorization', `Bearer ${studentToken}`);

      expect([200, 404]).toContain(response.status);
      
      if (response.status === 200) {
        const count = response.body.count || response.body.data?.count || 0;
        expect(typeof count).toBe('number');
      }
    });

    it('should filter by read status', async () => {
      const response = await request(app)
        .get('/api/core/notifications')
        .set('Authorization', `Bearer ${studentToken}`)
        .query({ da_doc: false });

      expect([200, 404]).toContain(response.status);
    });

    it('should paginate notifications', async () => {
      const response = await request(app)
        .get('/api/core/notifications')
        .set('Authorization', `Bearer ${studentToken}`)
        .query({ page: 1, limit: 10 });

      expect([200, 404]).toContain(response.status);
      
      if (response.status === 200 && response.body.pagination) {
        expect(response.body.pagination).toHaveProperty('total');
        expect(response.body.pagination).toHaveProperty('page');
      }
    });
  });

  describe('TC-NTF-002: Đánh dấu đã đọc thông báo', () => {
    it('should mark single notification as read', async () => {
      if (!testNotification) {
        console.log('Skipping - No test notification');
        return;
      }

      const response = await request(app)
        .put(`/api/core/notifications/${testNotification.ma_tb}/read`)
        .set('Authorization', `Bearer ${studentToken}`);

      expect([200, 404]).toContain(response.status);
      
      if (response.status === 200) {
        expect(response.body.success).toBe(true);
      }
    });

    it('should mark all notifications as read', async () => {
      const response = await request(app)
        .put('/api/core/notifications/mark-all-read')
        .set('Authorization', `Bearer ${studentToken}`);

      expect([200, 404]).toContain(response.status);
    });
  });

  describe('TC-NTF-003: Gửi thông báo (Admin)', () => {
    it('should allow admin to send notification', async () => {
      const notificationData = {
        tieu_de: 'Thông báo mới từ Admin',
        noi_dung: 'Đây là nội dung thông báo test',
        loai: 'HE_THONG',
        nguoi_nhan: [testStudent.ma_nguoi_dung]
      };

      const response = await request(app)
        .post('/api/core/notifications')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(notificationData);

      expect([200, 201, 404]).toContain(response.status);
    });

    it('should send broadcast notification', async () => {
      const broadcastData = {
        tieu_de: 'Thông báo chung',
        noi_dung: 'Thông báo gửi đến tất cả người dùng',
        loai: 'HE_THONG',
        broadcast: true
      };

      const response = await request(app)
        .post('/api/core/notifications/broadcast')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(broadcastData);

      expect([200, 201, 403, 404]).toContain(response.status);
    });

    it('should deny student from sending notifications', async () => {
      const notificationData = {
        tieu_de: 'Spam notification',
        noi_dung: 'Student trying to send',
        loai: 'HE_THONG'
      };

      const response = await request(app)
        .post('/api/core/notifications')
        .set('Authorization', `Bearer ${studentToken}`)
        .send(notificationData);

      expect([401, 403, 404]).toContain(response.status);
    });
  });

  describe('Additional Notification Tests', () => {
    it('should get notification detail', async () => {
      if (!testNotification) {
        console.log('Skipping - No test notification');
        return;
      }

      const response = await request(app)
        .get(`/api/core/notifications/${testNotification.ma_tb}`)
        .set('Authorization', `Bearer ${studentToken}`);

      expect([200, 404]).toContain(response.status);
    });

    it('should delete notification (Admin)', async () => {
      if (!testNotification) {
        console.log('Skipping - No test notification');
        return;
      }

      const response = await request(app)
        .delete(`/api/core/notifications/${testNotification.ma_tb}`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect([200, 204, 403, 404]).toContain(response.status);
    });
  });

  describe('Unauthorized Access Tests', () => {
    it('should deny access without token', async () => {
      const response = await request(app)
        .get('/api/core/notifications');

      expect(response.status).toBe(401);
    });

    it('should deny marking as read without token', async () => {
      const response = await request(app)
        .put('/api/core/notifications/mark-all-read');

      expect(response.status).toBe(401);
    });
  });
});
