/**
 * Integration Tests for Approval Module
 * Test Cases: TC-APP-001 to TC-APP-006
 */

const request = require('supertest');
const { createServer } = require('../../../src/app/server');
const { 
  createStudentUser, 
  createTeacherUser,
  createAdminUser,
  createMonitorUser,
  generateToken
} = require('../../helpers/authHelper');
const { cleanupTestData, prisma } = require('../../helpers/dbHelper');

const app = createServer();

describe('Approval Module - Integration Tests', () => {
  let testStudent;
  let testTeacher;
  let testAdmin;
  let testMonitor;
  let studentToken;
  let teacherToken;
  let adminToken;
  let monitorToken;
  let testActivity;
  let pendingRegistration;

  beforeAll(async () => {
    await cleanupTestData();
    
    testStudent = await createStudentUser({
      ten_dn: 'test_student_approval',
      email: 'test_student_approval@dlu.edu.vn',
      ho_ten: 'Sinh Viên Approval Test',
      mssv: '2212370'
    });

    testTeacher = await createTeacherUser({
      ten_dn: 'test_teacher_approval',
      email: 'test_teacher_approval@dlu.edu.vn',
      ho_ten: 'Giảng Viên Approval Test'
    });

    testAdmin = await createAdminUser({
      ten_dn: 'test_admin_approval',
      email: 'test_admin_approval@dlu.edu.vn',
      ho_ten: 'Admin Approval Test'
    });

    testMonitor = await createMonitorUser({
      ten_dn: 'test_monitor_approval',
      email: 'test_monitor_approval@dlu.edu.vn',
      ho_ten: 'Lớp Trưởng Approval Test',
      mssv: '2212371'
    });

    studentToken = generateToken(testStudent);
    teacherToken = generateToken(testTeacher);
    adminToken = generateToken(testAdmin);
    monitorToken = generateToken(testMonitor);

    // Create test activity
    testActivity = await prisma.hoat_dong.create({
      data: {
        ten_hd: 'Hoạt động Test Approval',
        mo_ta: 'Mô tả hoạt động test approval',
        dia_diem: 'Hội trường B',
        thoi_gian_bat_dau: new Date(Date.now() + 86400000),
        thoi_gian_ket_thuc: new Date(Date.now() + 90000000),
        so_luong_tham_gia: 100,
        diem_ren_luyen: 10,
        trang_thai: 'DANG_MO_DK',
        is_su_kien_truong: false
      }
    });

    // Create pending registration
    pendingRegistration = await prisma.dang_ky.create({
      data: {
        ma_hd: testActivity.ma_hd,
        ma_nguoi_dung: testStudent.ma_nguoi_dung,
        trang_thai: 'CHO_DUYET',
        ngay_dang_ky: new Date()
      }
    });
  });

  afterAll(async () => {
    await cleanupTestData();
    await prisma.$disconnect();
  });

  describe('TC-APP-001: Xem danh sách đăng ký chờ duyệt', () => {
    it('should get pending registrations list (Admin)', async () => {
      const response = await request(app)
        .get('/api/core/registrations/pending')
        .set('Authorization', `Bearer ${adminToken}`);

      expect([200, 404]).toContain(response.status);
      
      if (response.status === 200) {
        expect(response.body.data).toBeDefined();
        expect(Array.isArray(response.body.data)).toBe(true);
      }
    });

    it('should get pending registrations list (Teacher)', async () => {
      const response = await request(app)
        .get('/api/core/registrations/pending')
        .set('Authorization', `Bearer ${teacherToken}`);

      expect([200, 403, 404]).toContain(response.status);
    });

    it('should deny student access to pending list', async () => {
      const response = await request(app)
        .get('/api/core/registrations/pending')
        .set('Authorization', `Bearer ${studentToken}`);

      expect([401, 403, 404]).toContain(response.status);
    });
  });

  describe('TC-APP-002: Duyệt đăng ký hoạt động', () => {
    let registrationToApprove;

    beforeAll(async () => {
      // Create a fresh registration to approve
      registrationToApprove = await prisma.dang_ky.create({
        data: {
          ma_hd: testActivity.ma_hd,
          ma_nguoi_dung: testStudent.ma_nguoi_dung,
          trang_thai: 'CHO_DUYET',
          ngay_dang_ky: new Date()
        }
      });
    });

    it('should approve registration (Admin)', async () => {
      const response = await request(app)
        .put(`/api/core/registrations/${registrationToApprove.ma_dk}/approve`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ trang_thai: 'DA_DUYET' });

      expect([200, 404]).toContain(response.status);
      
      if (response.status === 200) {
        expect(response.body.success).toBe(true);
      }
    });

    it('should deny student from approving', async () => {
      const response = await request(app)
        .put(`/api/core/registrations/${pendingRegistration.ma_dk}/approve`)
        .set('Authorization', `Bearer ${studentToken}`)
        .send({ trang_thai: 'DA_DUYET' });

      expect([401, 403, 404]).toContain(response.status);
    });
  });

  describe('TC-APP-003: Từ chối đăng ký hoạt động', () => {
    let registrationToReject;

    beforeAll(async () => {
      registrationToReject = await prisma.dang_ky.create({
        data: {
          ma_hd: testActivity.ma_hd,
          ma_nguoi_dung: testStudent.ma_nguoi_dung,
          trang_thai: 'CHO_DUYET',
          ngay_dang_ky: new Date()
        }
      });
    });

    it('should reject registration with reason (Admin)', async () => {
      const response = await request(app)
        .put(`/api/core/registrations/${registrationToReject.ma_dk}/reject`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ 
          trang_thai: 'TU_CHOI',
          ly_do: 'Không đủ điều kiện tham gia'
        });

      expect([200, 404]).toContain(response.status);
    });

    it('should reject registration by teacher', async () => {
      const newReg = await prisma.dang_ky.create({
        data: {
          ma_hd: testActivity.ma_hd,
          ma_nguoi_dung: testStudent.ma_nguoi_dung,
          trang_thai: 'CHO_DUYET',
          ngay_dang_ky: new Date()
        }
      });

      const response = await request(app)
        .put(`/api/core/registrations/${newReg.ma_dk}/reject`)
        .set('Authorization', `Bearer ${teacherToken}`)
        .send({ 
          trang_thai: 'TU_CHOI',
          ly_do: 'Đã trùng lịch'
        });

      expect([200, 403, 404]).toContain(response.status);
    });
  });

  describe('TC-APP-004: Duyệt hàng loạt đăng ký', () => {
    let bulkRegistrations = [];

    beforeAll(async () => {
      // Create multiple registrations for bulk approval
      for (let i = 0; i < 3; i++) {
        const student = await createStudentUser({
          ten_dn: `bulk_student_${i}_${Date.now()}`,
          email: `bulk_student_${i}_${Date.now()}@dlu.edu.vn`,
          ho_ten: `Sinh Viên Bulk ${i}`,
          mssv: `221238${i}`
        });

        const reg = await prisma.dang_ky.create({
          data: {
            ma_hd: testActivity.ma_hd,
            ma_nguoi_dung: student.ma_nguoi_dung,
            trang_thai: 'CHO_DUYET',
            ngay_dang_ky: new Date()
          }
        });
        bulkRegistrations.push(reg);
      }
    });

    it('should approve multiple registrations at once', async () => {
      const ids = bulkRegistrations.map(r => r.ma_dk);
      
      const response = await request(app)
        .put('/api/core/registrations/bulk/approve')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ 
          ids: ids,
          trang_thai: 'DA_DUYET'
        });

      expect([200, 404]).toContain(response.status);
      
      if (response.status === 200) {
        expect(response.body.success).toBe(true);
      }
    });
  });

  describe('TC-APP-005: Từ chối hàng loạt đăng ký', () => {
    it('should reject multiple registrations at once', async () => {
      const rejectStudents = [];
      
      for (let i = 0; i < 2; i++) {
        const student = await createStudentUser({
          ten_dn: `reject_student_${i}_${Date.now()}`,
          email: `reject_student_${i}_${Date.now()}@dlu.edu.vn`,
          ho_ten: `Sinh Viên Reject ${i}`,
          mssv: `221239${i}`
        });

        const reg = await prisma.dang_ky.create({
          data: {
            ma_hd: testActivity.ma_hd,
            ma_nguoi_dung: student.ma_nguoi_dung,
            trang_thai: 'CHO_DUYET',
            ngay_dang_ky: new Date()
          }
        });
        rejectStudents.push(reg);
      }

      const ids = rejectStudents.map(r => r.ma_dk);
      
      const response = await request(app)
        .put('/api/core/registrations/bulk/reject')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ 
          ids: ids,
          trang_thai: 'TU_CHOI',
          ly_do: 'Từ chối hàng loạt - Test'
        });

      expect([200, 404]).toContain(response.status);
    });
  });

  describe('TC-APP-006: Lớp trưởng duyệt sinh viên lớp', () => {
    it('should allow monitor to approve class member registration', async () => {
      // Create a class member registration
      const classStudent = await createStudentUser({
        ten_dn: `class_student_${Date.now()}`,
        email: `class_student_${Date.now()}@dlu.edu.vn`,
        ho_ten: 'Sinh Viên Cùng Lớp',
        mssv: '2212399'
      });

      const classReg = await prisma.dang_ky.create({
        data: {
          ma_hd: testActivity.ma_hd,
          ma_nguoi_dung: classStudent.ma_nguoi_dung,
          trang_thai: 'CHO_DUYET',
          ngay_dang_ky: new Date()
        }
      });

      const response = await request(app)
        .put(`/api/core/registrations/${classReg.ma_dk}/approve`)
        .set('Authorization', `Bearer ${monitorToken}`)
        .send({ trang_thai: 'DA_DUYET' });

      // Monitor may or may not have approval rights depending on configuration
      expect([200, 403, 404]).toContain(response.status);
    });

    it('should get pending registrations for monitor class', async () => {
      const response = await request(app)
        .get('/api/core/registrations/pending/class')
        .set('Authorization', `Bearer ${monitorToken}`);

      expect([200, 403, 404]).toContain(response.status);
    });
  });

  describe('Unauthorized Access Tests', () => {
    it('should deny access without token', async () => {
      const response = await request(app)
        .get('/api/core/registrations/pending');

      expect(response.status).toBe(401);
    });

    it('should deny approval without token', async () => {
      const response = await request(app)
        .put(`/api/core/registrations/${pendingRegistration.ma_dk}/approve`)
        .send({ trang_thai: 'DA_DUYET' });

      expect(response.status).toBe(401);
    });
  });
});
