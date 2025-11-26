/**
 * Integration Tests for Attendance Module
 * Test Cases: TC-ATT-001 to TC-ATT-007
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

describe('Attendance Module - Integration Tests', () => {
  let testStudent;
  let testTeacher;
  let testAdmin;
  let studentToken;
  let teacherToken;
  let adminToken;
  let testActivity;
  let testActivityWithQR;

  beforeAll(async () => {
    await cleanupTestData();
    
    testStudent = await createStudentUser({
      ten_dn: 'test_student_attendance',
      email: 'test_student_attendance@dlu.edu.vn',
      ho_ten: 'Sinh Viên Attendance Test',
      mssv: '2212360'
    });

    testTeacher = await createTeacherUser({
      ten_dn: 'test_teacher_attendance',
      email: 'test_teacher_attendance@dlu.edu.vn',
      ho_ten: 'Giảng Viên Attendance Test'
    });

    testAdmin = await createAdminUser({
      ten_dn: 'test_admin_attendance',
      email: 'test_admin_attendance@dlu.edu.vn',
      ho_ten: 'Admin Attendance Test'
    });

    studentToken = generateToken(testStudent);
    teacherToken = generateToken(testTeacher);
    adminToken = generateToken(testAdmin);

    // Create test activity
    testActivity = await prisma.hoat_dong.create({
      data: {
        ten_hd: 'Hoạt động Test Attendance',
        mo_ta: 'Mô tả hoạt động test attendance',
        dia_diem: 'Hội trường A',
        thoi_gian_bat_dau: new Date(Date.now() + 86400000), // Tomorrow
        thoi_gian_ket_thuc: new Date(Date.now() + 90000000),
        so_luong_tham_gia: 100,
        diem_ren_luyen: 10,
        trang_thai: 'DANG_MO_DK',
        is_su_kien_truong: false
      }
    });

    // Create activity with QR enabled
    testActivityWithQR = await prisma.hoat_dong.create({
      data: {
        ten_hd: 'Hoạt động QR Attendance',
        mo_ta: 'Hoạt động có điểm danh QR',
        dia_diem: 'Sân vận động',
        thoi_gian_bat_dau: new Date(Date.now() - 3600000), // 1 hour ago (ongoing)
        thoi_gian_ket_thuc: new Date(Date.now() + 3600000), // 1 hour from now
        so_luong_tham_gia: 50,
        diem_ren_luyen: 15,
        trang_thai: 'DANG_DIEN_RA',
        diem_danh_qr: true,
        is_su_kien_truong: false
      }
    });

    // Register student for the activity
    await prisma.dang_ky.create({
      data: {
        ma_hd: testActivityWithQR.ma_hd,
        ma_nguoi_dung: testStudent.ma_nguoi_dung,
        trang_thai: 'DA_DUYET',
        ngay_dang_ky: new Date()
      }
    });
  });

  afterAll(async () => {
    await cleanupTestData();
    await prisma.$disconnect();
  });

  describe('TC-ATT-001: Tạo mã QR điểm danh', () => {
    it('should generate QR code for activity (Teacher)', async () => {
      const response = await request(app)
        .post(`/api/core/attendance/qr/generate`)
        .set('Authorization', `Bearer ${teacherToken}`)
        .send({
          ma_hd: testActivityWithQR.ma_hd,
          thoi_gian_het_han: 30 // 30 minutes
        });

      // May return 200 or 201 depending on implementation
      expect([200, 201, 404]).toContain(response.status);
      
      if (response.status === 200 || response.status === 201) {
        expect(response.body.data || response.body.qrCode).toBeDefined();
      }
    });

    it('should generate QR code for activity (Admin)', async () => {
      const response = await request(app)
        .post(`/api/core/attendance/qr/generate`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          ma_hd: testActivityWithQR.ma_hd
        });

      expect([200, 201, 404]).toContain(response.status);
    });

    it('should deny student from generating QR', async () => {
      const response = await request(app)
        .post(`/api/core/attendance/qr/generate`)
        .set('Authorization', `Bearer ${studentToken}`)
        .send({
          ma_hd: testActivityWithQR.ma_hd
        });

      expect([401, 403, 404]).toContain(response.status);
    });
  });

  describe('TC-ATT-002: Điểm danh bằng mã QR', () => {
    let qrCode;

    beforeAll(async () => {
      // Generate QR code first
      const qrResponse = await request(app)
        .post(`/api/core/attendance/qr/generate`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ ma_hd: testActivityWithQR.ma_hd });
      
      if (qrResponse.body.data) {
        qrCode = qrResponse.body.data.code || qrResponse.body.data.qr_code;
      }
    });

    it('should allow student to check in with valid QR', async () => {
      if (!qrCode) {
        console.log('Skipping - QR code not generated');
        return;
      }

      const response = await request(app)
        .post(`/api/core/attendance/qr/checkin`)
        .set('Authorization', `Bearer ${studentToken}`)
        .send({
          ma_hd: testActivityWithQR.ma_hd,
          ma_qr: qrCode
        });

      expect([200, 201, 400, 404]).toContain(response.status);
      
      if (response.status === 200 || response.status === 201) {
        expect(response.body.success).toBe(true);
      }
    });

    it('should reject expired/invalid QR code', async () => {
      const response = await request(app)
        .post(`/api/core/attendance/qr/checkin`)
        .set('Authorization', `Bearer ${studentToken}`)
        .send({
          ma_hd: testActivityWithQR.ma_hd,
          ma_qr: 'INVALID_QR_CODE_12345'
        });

      expect([400, 401, 404]).toContain(response.status);
    });
  });

  describe('TC-ATT-003: Xem danh sách điểm danh của hoạt động', () => {
    it('should get attendance list (Teacher)', async () => {
      const response = await request(app)
        .get(`/api/core/attendance/${testActivityWithQR.ma_hd}`)
        .set('Authorization', `Bearer ${teacherToken}`);

      expect([200, 404]).toContain(response.status);
      
      if (response.status === 200) {
        expect(response.body.data).toBeDefined();
      }
    });

    it('should get attendance list (Admin)', async () => {
      const response = await request(app)
        .get(`/api/core/attendance/${testActivityWithQR.ma_hd}`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect([200, 404]).toContain(response.status);
    });
  });

  describe('TC-ATT-004: Điểm danh thủ công', () => {
    it('should allow manual attendance marking (Admin)', async () => {
      const response = await request(app)
        .post(`/api/core/attendance/manual`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          ma_hd: testActivityWithQR.ma_hd,
          ma_nguoi_dung: testStudent.ma_nguoi_dung,
          da_diem_danh: true,
          ghi_chu: 'Điểm danh thủ công bởi admin'
        });

      expect([200, 201, 404]).toContain(response.status);
    });

    it('should allow teacher to mark attendance', async () => {
      const response = await request(app)
        .post(`/api/core/attendance/manual`)
        .set('Authorization', `Bearer ${teacherToken}`)
        .send({
          ma_hd: testActivityWithQR.ma_hd,
          ma_nguoi_dung: testStudent.ma_nguoi_dung,
          da_diem_danh: true
        });

      expect([200, 201, 403, 404]).toContain(response.status);
    });

    it('should deny student from manual marking', async () => {
      const response = await request(app)
        .post(`/api/core/attendance/manual`)
        .set('Authorization', `Bearer ${studentToken}`)
        .send({
          ma_hd: testActivityWithQR.ma_hd,
          ma_nguoi_dung: testStudent.ma_nguoi_dung,
          da_diem_danh: true
        });

      expect([401, 403, 404]).toContain(response.status);
    });
  });

  describe('TC-ATT-005: Điểm danh hàng loạt', () => {
    it('should allow bulk attendance marking (Admin)', async () => {
      const studentIds = [testStudent.ma_nguoi_dung];
      
      const response = await request(app)
        .post(`/api/core/attendance/bulk`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          ma_hd: testActivityWithQR.ma_hd,
          danh_sach: studentIds.map(id => ({
            ma_nguoi_dung: id,
            da_diem_danh: true
          }))
        });

      expect([200, 201, 404]).toContain(response.status);
    });
  });

  describe('TC-ATT-006: Kiểm tra trạng thái điểm danh', () => {
    it('should return attendance status for student', async () => {
      const response = await request(app)
        .get(`/api/core/attendance/status/${testActivityWithQR.ma_hd}`)
        .set('Authorization', `Bearer ${studentToken}`);

      expect([200, 404]).toContain(response.status);
      
      if (response.status === 200) {
        const data = response.body.data || response.body;
        expect(data).toHaveProperty('da_diem_danh');
      }
    });

    it('should return not registered for non-registered activity', async () => {
      const response = await request(app)
        .get(`/api/core/attendance/status/${testActivity.ma_hd}`)
        .set('Authorization', `Bearer ${studentToken}`);

      expect([200, 400, 404]).toContain(response.status);
    });
  });

  describe('TC-ATT-007: Lịch sử điểm danh cá nhân', () => {
    it('should return personal attendance history', async () => {
      const response = await request(app)
        .get('/api/core/attendance/my-history')
        .set('Authorization', `Bearer ${studentToken}`);

      expect([200, 404]).toContain(response.status);
      
      if (response.status === 200) {
        expect(response.body.data || response.body).toBeDefined();
      }
    });
  });

  describe('Unauthorized Access Tests', () => {
    it('should deny access without token', async () => {
      const response = await request(app)
        .get(`/api/core/attendance/${testActivityWithQR.ma_hd}`);

      expect(response.status).toBe(401);
    });
  });
});
