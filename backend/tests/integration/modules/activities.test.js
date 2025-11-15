/**
 * Integration Tests for Activities Module
 */

const request = require('supertest');
const express = require('express');
const { prisma } = require('../../../src/config/database');
const activitiesModule = require('../../../src/modules/activities');
const { createTestAdmin, createTestActivity, generateTestToken, cleanupTestData } = require('../../helpers/testHelpers');

// Create test app
function createTestApp() {
  const app = express();
  app.use(express.json());
  
  // Mock auth middleware
  app.use((req, res, next) => {
    if (req.headers.authorization) {
      const token = req.headers.authorization.replace('Bearer ', '');
      try {
        const jwt = require('jsonwebtoken');
        req.user = jwt.verify(token, process.env.JWT_SECRET || 'test-secret');
      } catch (error) {
        return res.status(401).json({ error: 'Invalid token' });
      }
    }
    next();
  });

  app.use('/api/core/activities', activitiesModule.routes);
  
  return app;
}

describe('Activities Module - Integration Tests', () => {
  let app;
  let admin;
  let token;

  beforeAll(async () => {
    app = createTestApp();
  });

  beforeEach(async () => {
    await cleanupTestData();
    admin = await createTestAdmin();
    token = generateTestToken(admin);
  });

  afterAll(async () => {
    await cleanupTestData();
    await prisma.$disconnect();
  });

  describe('GET /api/core/activities', () => {
    it('should return list of activities', async () => {
      // Create test activities
      await createTestActivity({ ten_hd: 'Test Activity 1' });
      await createTestActivity({ ten_hd: 'Test Activity 2' });

      const response = await request(app)
        .get('/api/core/activities')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(response.body).toHaveProperty('data');
      expect(Array.isArray(response.body.data)).toBe(true);
      expect(response.body.data.length).toBeGreaterThanOrEqual(2);
    });

    it('should filter activities by status', async () => {
      await createTestActivity({ 
        ten_hd: 'Open Activity',
        trang_thai: 'dang_mo'
      });
      await createTestActivity({ 
        ten_hd: 'Closed Activity',
        trang_thai: 'da_dong'
      });

      const response = await request(app)
        .get('/api/core/activities?status=dang_mo')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(response.body.data).toBeDefined();
      expect(response.body.data.every(a => a.trang_thai === 'dang_mo')).toBe(true);
    });

    it('should paginate results', async () => {
      // Create multiple activities
      for (let i = 0; i < 5; i++) {
        await createTestActivity({ ten_hd: `Test Activity ${i}` });
      }

      const response = await request(app)
        .get('/api/core/activities?page=1&limit=2')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(response.body).toHaveProperty('pagination');
      expect(response.body.pagination.per_page).toBe(2);
      expect(response.body.data.length).toBeLessThanOrEqual(2);
    });
  });

  describe('GET /api/core/activities/:id', () => {
    it('should return activity by ID', async () => {
      const activity = await createTestActivity({ ten_hd: 'Test Activity' });

      const response = await request(app)
        .get(`/api/core/activities/${activity.id}`)
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(response.body).toHaveProperty('data');
      expect(response.body.data.id).toBe(activity.id);
      expect(response.body.data.ten_hd).toBe('Test Activity');
    });

    it('should return 404 for non-existent activity', async () => {
      const response = await request(app)
        .get('/api/core/activities/non-existent-id')
        .set('Authorization', `Bearer ${token}`)
        .expect(404);

      expect(response.body).toHaveProperty('error');
    });
  });

  describe('POST /api/core/activities', () => {
    it('should create new activity', async () => {
      let loaiHD = await prisma.loaiHoatDong.findFirst();
      if (!loaiHD) {
        loaiHD = await prisma.loaiHoatDong.create({
          data: {
            ten_loai_hd: 'Test Type',
            mo_ta: 'Test description',
            diem_rl_toi_da: 10,
          }
        });
      }

      const activityData = {
        ten_hd: 'New Test Activity',
        mo_ta: 'Test description',
        dia_diem: 'Test Location',
        ngay_bd: new Date().toISOString(),
        ngay_kt: new Date(Date.now() + 86400000).toISOString(),
        han_dk: new Date(Date.now() + 43200000).toISOString(),
        diem_rl: 5,
        so_luong_toi_da: 100,
        loai_hd_id: loaiHD.id,
        hoc_ky: 'hoc_ky_1',
        nam_hoc: '2024-2025',
      };

      const response = await request(app)
        .post('/api/core/activities')
        .set('Authorization', `Bearer ${token}`)
        .send(activityData)
        .expect(201);

      expect(response.body).toHaveProperty('data');
      expect(response.body.data.ten_hd).toBe('New Test Activity');
    });

    it('should validate required fields', async () => {
      const invalidData = {
        // Missing required fields
        ten_hd: 'Test Activity',
      };

      const response = await request(app)
        .post('/api/core/activities')
        .set('Authorization', `Bearer ${token}`)
        .send(invalidData)
        .expect(400);

      expect(response.body).toHaveProperty('error');
    });
  });

  describe('PUT /api/core/activities/:id', () => {
    it('should update activity', async () => {
      const activity = await createTestActivity({ ten_hd: 'Original Name' });

      const updateData = {
        ten_hd: 'Updated Name',
        mo_ta: 'Updated description',
      };

      const response = await request(app)
        .put(`/api/core/activities/${activity.id}`)
        .set('Authorization', `Bearer ${token}`)
        .send(updateData)
        .expect(200);

      expect(response.body.data.ten_hd).toBe('Updated Name');
      expect(response.body.data.mo_ta).toBe('Updated description');
    });

    it('should return 404 for non-existent activity', async () => {
      const response = await request(app)
        .put('/api/core/activities/non-existent-id')
        .set('Authorization', `Bearer ${token}`)
        .send({ ten_hd: 'Updated' })
        .expect(404);

      expect(response.body).toHaveProperty('error');
    });
  });

  describe('DELETE /api/core/activities/:id', () => {
    it('should delete activity', async () => {
      const activity = await createTestActivity({ ten_hd: 'To Delete' });

      await request(app)
        .delete(`/api/core/activities/${activity.id}`)
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      // Verify deletion
      const deleted = await prisma.hoatDong.findUnique({
        where: { id: activity.id }
      });
      expect(deleted).toBeNull();
    });

    it('should return 404 for non-existent activity', async () => {
      const response = await request(app)
        .delete('/api/core/activities/non-existent-id')
        .set('Authorization', `Bearer ${token}`)
        .expect(404);

      expect(response.body).toHaveProperty('error');
    });
  });
});

