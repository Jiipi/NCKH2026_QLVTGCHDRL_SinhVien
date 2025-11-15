/**
 * Unit Tests for Broadcast Service
 */

const broadcastService = require('../../../src/services/broadcast.service');
const { prisma } = require('../../../src/config/database');
const { createTestUser, createTestAdmin, cleanupTestData } = require('../../helpers/testHelpers');

describe('Broadcast Service - Unit Tests', () => {
  let admin;
  let loaiTB;

  beforeEach(async () => {
    await cleanupTestData();
    admin = await createTestAdmin();
    
    // Create notification type
    loaiTB = await prisma.loaiThongBao.findFirst({
      where: { ten_loai_tb: 'Thông báo chung' }
    });

    if (!loaiTB) {
      loaiTB = await prisma.loaiThongBao.create({
        data: {
          ten_loai_tb: 'Thông báo chung',
          mo_ta: 'Thông báo chung cho tất cả người dùng'
        }
      });
    }
  });

  afterAll(async () => {
    await cleanupTestData();
    await prisma.$disconnect();
  });

  describe('sendBroadcast', () => {
    it('should send broadcast to all users', async () => {
      // Create test users
      const user1 = await createTestUser();
      const user2 = await createTestUser();

      const data = {
        title: 'Test Broadcast',
        message: 'This is a test broadcast message',
        scope: 'all',
        priority: 'cao',
        method: 'trong_he_thong'
      };

      const result = await broadcastService.sendBroadcast(data, admin.id);

      expect(result).toHaveProperty('count');
      expect(result.count).toBeGreaterThanOrEqual(2); // At least 2 users
      expect(result).toHaveProperty('scope', 'all');
    });

    it('should send broadcast to specific role', async () => {
      // Create users with different roles
      const student1 = await createTestUser();
      const student2 = await createTestUser();
      const admin2 = await createTestAdmin();

      const data = {
        title: 'Test Broadcast to Students',
        message: 'Message for students only',
        scope: 'role',
        role: 'SINH_VIEN',
        priority: 'trung_binh',
        method: 'trong_he_thong'
      };

      const result = await broadcastService.sendBroadcast(data, admin.id);

      expect(result).toHaveProperty('count');
      expect(result.count).toBeGreaterThanOrEqual(2);
      expect(result).toHaveProperty('scope', 'role');
      expect(result).toHaveProperty('role', 'SINH_VIEN');
    });

    it('should validate required fields', async () => {
      const invalidData = {
        // Missing title
        message: 'Test message',
        scope: 'all'
      };

      await expect(
        broadcastService.sendBroadcast(invalidData, admin.id)
      ).rejects.toThrow();
    });
  });

  describe('getBroadcastHistory', () => {
    it('should return broadcast history', async () => {
      // Send a broadcast first
      const user1 = await createTestUser();
      
      await broadcastService.sendBroadcast({
        title: 'Test Broadcast',
        message: 'Test message',
        scope: 'all',
        priority: 'cao',
        method: 'trong_he_thong'
      }, admin.id);

      const result = await broadcastService.getBroadcastHistory(admin.id, {
        page: 1,
        limit: 10
      });

      expect(result).toHaveProperty('notifications');
      expect(result).toHaveProperty('pagination');
      expect(Array.isArray(result.notifications)).toBe(true);
    });
  });
});

