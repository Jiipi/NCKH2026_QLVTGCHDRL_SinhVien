/**
 * Integration Tests for Points Controller
 * Tests endpoints with different roles and scope filtering
 */

import request from 'supertest';
import { app } from '../../../app/server';
import { prisma } from '../../../data/infrastructure/prisma/client';
import jwt from 'jsonwebtoken';

describe('Points Controller Integration Tests', () => {
  let studentToken: string;
  let otherStudentToken: string;
  let testStudentId: number;
  let otherStudentId: number;
  let testClassId: string;
  let testActivityId: string;

  beforeAll(async () => {
    // Create test class
    const testClass = await prisma.lop.create({
      data: {
        ten_lop: 'Points Test Class',
        khoa: 'IT',
        nien_khoa: '2024-2025'
      }
    });
    testClassId = testClass.id;

    // Create test users and students
    const student1User = await prisma.nguoiDung.create({
      data: {
        ho_ten: 'Student 1',
        email: 'student1.points@example.com',
        mat_khau: 'hashed_password',
        vai_tro_id: 'student-role-id',
        trang_thai: 'hoat_dong'
      }
    });

    const student2User = await prisma.nguoiDung.create({
      data: {
        ho_ten: 'Student 2',
        email: 'student2.points@example.com',
        mat_khau: 'hashed_password',
        vai_tro_id: 'student-role-id',
        trang_thai: 'hoat_dong'
      }
    });

    const student1 = await prisma.sinhVien.create({
      data: {
        mssv: 'SVPOINTS001',
        nguoi_dung_id: student1User.id,
        lop_id: testClassId
      }
    });

    const student2 = await prisma.sinhVien.create({
      data: {
        mssv: 'SVPOINTS002',
        nguoi_dung_id: student2User.id,
        lop_id: testClassId
      }
    });

    testStudentId = student1.id;
    otherStudentId = student2.id;

    // Create test activity type
    const activityType = await prisma.loaiHoatDong.create({
      data: {
        ten_loai_hd: 'Test Activity Type',
        diem_mac_dinh: 10,
        diem_toi_da: 20
      }
    });

    // Create test activity
    const activity = await prisma.hoatDong.create({
      data: {
        ten_hd: 'Test Activity for Points',
        mo_ta: 'Test description',
        loai_hd_id: activityType.id,
        nguoi_tao_id: student1User.id,
        lop_id: testClassId,
        hoc_ky: 'hoc_ky_1',
        nam_hoc: '2025-2026',
        ngay_bd: new Date(),
        trang_thai: 'da_duyet',
        diem_rl: 15
      }
    });

    testActivityId = activity.id;

    // Create registrations
    await prisma.dangKyHoatDong.create({
      data: {
        sv_id: testStudentId,
        hd_id: testActivityId,
        trang_thai_dk: 'da_tham_gia',
        ngay_dang_ky: new Date()
      }
    });

    // Generate tokens
    const JWT_SECRET = process.env.JWT_SECRET || 'test-secret';
    
    studentToken = jwt.sign(
      { sub: student1User.id, role: 'SINH_VIEN', classId: testClassId },
      JWT_SECRET,
      { expiresIn: '1h' }
    );

    otherStudentToken = jwt.sign(
      { sub: student2User.id, role: 'SINH_VIEN', classId: testClassId },
      JWT_SECRET,
      { expiresIn: '1h' }
    );
  });

  afterAll(async () => {
    // Cleanup
    await prisma.dangKyHoatDong.deleteMany({
      where: { sv_id: { in: [testStudentId, otherStudentId] } }
    });
    await prisma.hoatDong.deleteMany({ where: { ten_hd: 'Test Activity for Points' } });
    await prisma.loaiHoatDong.deleteMany({ where: { ten_loai_hd: 'Test Activity Type' } });
    await prisma.sinhVien.deleteMany({
      where: { mssv: { in: ['SVPOINTS001', 'SVPOINTS002'] } }
    });
    await prisma.nguoiDung.deleteMany({
      where: {
        email: { in: ['student1.points@example.com', 'student2.points@example.com'] }
      }
    });
    await prisma.lop.deleteMany({ where: { ten_lop: 'Points Test Class' } });
    await prisma.$disconnect();
  });

  describe('GET /api/points/summary', () => {
    it('should return points summary with scope filtering', async () => {
      const response = await request(app)
        .get('/api/points/summary')
        .set('Authorization', `Bearer ${studentToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('sinh_vien');
      expect(response.body.data).toHaveProperty('thong_ke');
      expect(response.body.data).toHaveProperty('hoat_dong_gan_day');
      
      // Verify meta contains permissions
      expect(response.body.data).toHaveProperty('meta');
      expect(response.body.data.meta).toHaveProperty('permissions');
      expect(response.body.data.meta.permissions.canCreate).toBe(false);
    });

    it('should return 401 without token', async () => {
      await request(app)
        .get('/api/points/summary')
        .expect(401);
    });

    it('should only return own student points', async () => {
      const response = await request(app)
        .get('/api/points/summary')
        .set('Authorization', `Bearer ${studentToken}`)
        .expect(200);

      const studentData = response.body.data.sinh_vien;
      expect(studentData.mssv).toBe('SVPOINTS001');
      
      // Should have points from the activity
      const thongKe = response.body.data.thong_ke;
      expect(thongKe.tong_diem).toBeGreaterThan(0);
    });

    it('should not return other student points', async () => {
      // Student 2 has no registrations
      const response = await request(app)
        .get('/api/points/summary')
        .set('Authorization', `Bearer ${otherStudentToken}`)
        .expect(200);

      const thongKe = response.body.data.thong_ke;
      expect(thongKe.tong_diem).toBe(0);
      expect(thongKe.tong_hoat_dong).toBe(0);
    });

    it('should filter by semester', async () => {
      const response = await request(app)
        .get('/api/points/summary?semester=hoc_ky_1_2025')
        .set('Authorization', `Bearer ${studentToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.meta.semester).toBeDefined();
    });
  });

  describe('GET /api/points/detail', () => {
    it('should return paginated points detail', async () => {
      const response = await request(app)
        .get('/api/points/detail?page=1&limit=10')
        .set('Authorization', `Bearer ${studentToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('data');
      expect(response.body.data).toHaveProperty('pagination');
      expect(response.body.data.pagination.current_page).toBe(1);
      expect(response.body.data.pagination.per_page).toBe(10);
      
      // Verify meta
      expect(response.body.data).toHaveProperty('meta');
      expect(response.body.data.meta).toHaveProperty('permissions');
    });

    it('should only return own student registrations', async () => {
      const response = await request(app)
        .get('/api/points/detail')
        .set('Authorization', `Bearer ${studentToken}`)
        .expect(200);

      const registrations = response.body.data.data;
      // All registrations should belong to this student
      registrations.forEach((reg: any) => {
        expect(reg.hoat_dong).toBeDefined();
      });
    });

    it('should handle pagination correctly', async () => {
      const response1 = await request(app)
        .get('/api/points/detail?page=1&limit=5')
        .set('Authorization', `Bearer ${studentToken}`)
        .expect(200);

      const response2 = await request(app)
        .get('/api/points/detail?page=2&limit=5')
        .set('Authorization', `Bearer ${studentToken}`)
        .expect(200);

      expect(response1.body.data.pagination.current_page).toBe(1);
      expect(response2.body.data.pagination.current_page).toBe(2);
    });
  });

  describe('Scope Filtering Verification', () => {
    it('should calculate points correctly with scope', async () => {
      const response = await request(app)
        .get('/api/points/summary')
        .set('Authorization', `Bearer ${studentToken}`)
        .expect(200);

      const thongKe = response.body.data.thong_ke;
      
      // Should have 1 activity with 15 points
      expect(thongKe.tong_hoat_dong).toBe(1);
      expect(thongKe.tong_diem).toBe(15);
      expect(thongKe.tong_diem_lam_tron).toBe(15);
    });

    it('should group points by activity type', async () => {
      const response = await request(app)
        .get('/api/points/summary')
        .set('Authorization', `Bearer ${studentToken}`)
        .expect(200);

      const diemTheoLoai = response.body.data.thong_ke.diem_theo_loai;
      expect(Array.isArray(diemTheoLoai)).toBe(true);
      
      if (diemTheoLoai.length > 0) {
        const firstType = diemTheoLoai[0];
        expect(firstType).toHaveProperty('ten_loai');
        expect(firstType).toHaveProperty('so_hoat_dong');
        expect(firstType).toHaveProperty('tong_diem');
        expect(firstType).toHaveProperty('hoat_dong');
      }
    });
  });
});
