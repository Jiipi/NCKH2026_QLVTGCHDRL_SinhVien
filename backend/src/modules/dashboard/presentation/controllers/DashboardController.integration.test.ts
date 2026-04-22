/**
 * Integration Tests for Dashboard Controller
 * Tests endpoints with different roles and scope filtering
 */

import request from 'supertest';
import { app } from '../../../app/server';
import { prisma } from '../../../data/infrastructure/prisma/client';
import jwt from 'jsonwebtoken';

describe('Dashboard Controller Integration Tests', () => {
  let adminToken: string;
  let teacherToken: string;
  let studentToken: string;
  let testUserId: string;
  let testStudentId: number;
  let testClassId: string;

  beforeAll(async () => {
    // Setup test data
    // Create test class
    const testClass = await prisma.lop.create({
      data: {
        ten_lop: 'Test Class A',
        khoa: 'IT',
        nien_khoa: '2024-2025'
      }
    });
    testClassId = testClass.id;

    // Create test users
    const adminUser = await prisma.nguoiDung.create({
      data: {
        ho_ten: 'Admin Test',
        email: 'admin.test@example.com',
        mat_khau: 'hashed_password',
        vai_tro_id: 'admin-role-id',
        trang_thai: 'hoat_dong'
      }
    });

    const teacherUser = await prisma.nguoiDung.create({
      data: {
        ho_ten: 'Teacher Test',
        email: 'teacher.test@example.com',
        mat_khau: 'hashed_password',
        vai_tro_id: 'teacher-role-id',
        trang_thai: 'hoat_dong'
      }
    });

    const studentUser = await prisma.nguoiDung.create({
      data: {
        ho_ten: 'Student Test',
        email: 'student.test@example.com',
        mat_khau: 'hashed_password',
        vai_tro_id: 'student-role-id',
        trang_thai: 'hoat_dong'
      }
    });

    testUserId = studentUser.id;

    // Create test student
    const testStudent = await prisma.sinhVien.create({
      data: {
        mssv: 'SV001TEST',
        nguoi_dung_id: studentUser.id,
        lop_id: testClassId
      }
    });

    testStudentId = testStudent.id;

    // Generate tokens
    const JWT_SECRET = process.env.JWT_SECRET || 'test-secret';
    
    adminToken = jwt.sign(
      { sub: adminUser.id, role: 'ADMIN' },
      JWT_SECRET,
      { expiresIn: '1h' }
    );

    teacherToken = jwt.sign(
      { sub: teacherUser.id, role: 'GIANG_VIEN', classId: testClassId },
      JWT_SECRET,
      { expiresIn: '1h' }
    );

    studentToken = jwt.sign(
      { sub: studentUser.id, role: 'SINH_VIEN', classId: testClassId },
      JWT_SECRET,
      { expiresIn: '1h' }
    );
  });

  afterAll(async () => {
    // Cleanup test data
    await prisma.sinhVien.deleteMany({ where: { mssv: 'SV001TEST' } });
    await prisma.nguoiDung.deleteMany({
      where: {
        email: {
          in: ['admin.test@example.com', 'teacher.test@example.com', 'student.test@example.com']
        }
      }
    });
    await prisma.lop.deleteMany({ where: { ten_lop: 'Test Class A' } });
    await prisma.$disconnect();
  });

  describe('GET /api/dashboard', () => {
    it('should return student dashboard with scope filtering', async () => {
      const response = await request(app)
        .get('/api/dashboard')
        .set('Authorization', `Bearer ${studentToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('sinh_vien');
      expect(response.body.data).toHaveProperty('activities');
      expect(response.body.data).toHaveProperty('tong_quan');
      
      // Verify meta contains permissions
      expect(response.body.data).toHaveProperty('meta');
      expect(response.body.data.meta).toHaveProperty('permissions');
      expect(response.body.data.meta.permissions.canCreate).toBe(false);
    });

    it('should return 401 without token', async () => {
      await request(app)
        .get('/api/dashboard')
        .expect(401);
    });

    it('should filter data by semester', async () => {
      const response = await request(app)
        .get('/api/dashboard?semester=hoc_ky_1_2025')
        .set('Authorization', `Bearer ${studentToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      // Verify semester filter was applied
      expect(response.body.data.meta.semester).toEqual({
        hoc_ky: 'hoc_ky_1',
        nam_hoc: '2025-2026'
      });
    });
  });

  describe('GET /api/admin/dashboard', () => {
    it('should return admin dashboard for admin role', async () => {
      const response = await request(app)
        .get('/api/admin/dashboard')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('totalUsers');
      expect(response.body.data).toHaveProperty('totalActivities');
      expect(response.body.data).toHaveProperty('meta');
      expect(response.body.data.meta.permissions.canCreate).toBe(true);
    });

    it('should return 403 for student role', async () => {
      await request(app)
        .get('/api/admin/dashboard')
        .set('Authorization', `Bearer ${studentToken}`)
        .expect(403);
    });

    it('should filter admin dashboard by semester', async () => {
      const response = await request(app)
        .get('/api/admin/dashboard?semester=hoc_ky_1_2025')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.meta.semester).toBeDefined();
    });
  });

  describe('Scope Filtering Verification', () => {
    it('should only return student own data', async () => {
      const response = await request(app)
        .get('/api/dashboard')
        .set('Authorization', `Bearer ${studentToken}`)
        .expect(200);

      const studentData = response.body.data.sinh_vien;
      expect(studentData.id).toBe(testStudentId);
      expect(studentData.mssv).toBe('SV001TEST');
    });

    it('should not allow student to see other class data', async () => {
      // Create another class and student
      const otherClass = await prisma.lop.create({
        data: {
          ten_lop: 'Test Class B',
          khoa: 'IT',
          nien_khoa: '2024-2025'
        }
      });

      const otherUser = await prisma.nguoiDung.create({
        data: {
          ho_ten: 'Other Student',
          email: 'other.student@example.com',
          mat_khau: 'hashed_password',
          vai_tro_id: 'student-role-id',
          trang_thai: 'hoat_dong'
        }
      });

      await prisma.sinhVien.create({
        data: {
          mssv: 'SV002TEST',
          nguoi_dung_id: otherUser.id,
          lop_id: otherClass.id
        }
      });

      // Student from Class A should not see Class B data
      const response = await request(app)
        .get('/api/dashboard')
        .set('Authorization', `Bearer ${studentToken}`)
        .expect(200);

      const activities = response.body.data.activities;
      // All activities should belong to Class A
      activities.forEach((activity: any) => {
        if (activity.hoat_dong.lop_id) {
          expect(activity.hoat_dong.lop_id).toBe(testClassId);
        }
      });

      // Cleanup
      await prisma.sinhVien.deleteMany({ where: { mssv: 'SV002TEST' } });
      await prisma.nguoiDung.deleteMany({ where: { email: 'other.student@example.com' } });
      await prisma.lop.deleteMany({ where: { ten_lop: 'Test Class B' } });
    });
  });
});
