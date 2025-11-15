/**
 * Unit Tests for Auth Service
 */

const authService = require('../../../src/services/auth.service');
const { prisma } = require('../../../src/config/database');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { createTestUser, createTestAdmin, cleanupTestData } = require('../../helpers/testHelpers');

describe('Auth Service - Unit Tests', () => {
  beforeEach(async () => {
    await cleanupTestData();
  });

  afterAll(async () => {
    await cleanupTestData();
    await prisma.$disconnect();
  });

  describe('login', () => {
    it('should login successfully with valid credentials', async () => {
      // Create test user
      const password = 'password123';
      const hashedPassword = await bcrypt.hash(password, 10);
      const user = await createTestUser({
        ten_dn: 'testuser',
        mat_khau: hashedPassword,
      });

      // Login
      const result = await authService.login('testuser', password);

      expect(result).toHaveProperty('token');
      expect(result).toHaveProperty('user');
      expect(result.user.ten_dn).toBe('testuser');
    });

    it('should fail with invalid username', async () => {
      await expect(
        authService.login('nonexistent', 'password123')
      ).rejects.toThrow();
    });

    it('should fail with invalid password', async () => {
      const password = 'password123';
      const hashedPassword = await bcrypt.hash(password, 10);
      await createTestUser({
        ten_dn: 'testuser',
        mat_khau: hashedPassword,
      });

      await expect(
        authService.login('testuser', 'wrongpassword')
      ).rejects.toThrow();
    });
  });

  describe('verifyToken', () => {
    it('should verify valid token', async () => {
      const user = await createTestUser();
      const token = jwt.sign(
        { id: user.id, ten_dn: user.ten_dn },
        process.env.JWT_SECRET || 'test-secret',
        { expiresIn: '1h' }
      );

      const decoded = authService.verifyToken(token);
      expect(decoded).toHaveProperty('id', user.id);
      expect(decoded).toHaveProperty('ten_dn', user.ten_dn);
    });

    it('should reject invalid token', () => {
      expect(() => {
        authService.verifyToken('invalid-token');
      }).toThrow();
    });

    it('should reject expired token', () => {
      const user = { id: '1', ten_dn: 'test' };
      const token = jwt.sign(
        user,
        process.env.JWT_SECRET || 'test-secret',
        { expiresIn: '0s' }
      );

      expect(() => {
        authService.verifyToken(token);
      }).toThrow();
    });
  });

  describe('hashPassword', () => {
    it('should hash password correctly', async () => {
      const password = 'password123';
      const hashed = await authService.hashPassword(password);

      expect(hashed).toBeDefined();
      expect(hashed).not.toBe(password);
      expect(hashed.startsWith('$2')).toBe(true);
    });

    it('should generate different hashes for same password', async () => {
      const password = 'password123';
      const hash1 = await authService.hashPassword(password);
      const hash2 = await authService.hashPassword(password);

      expect(hash1).not.toBe(hash2);
    });
  });

  describe('comparePassword', () => {
    it('should return true for matching password', async () => {
      const password = 'password123';
      const hashed = await bcrypt.hash(password, 10);

      const result = await authService.comparePassword(password, hashed);
      expect(result).toBe(true);
    });

    it('should return false for non-matching password', async () => {
      const password = 'password123';
      const hashed = await bcrypt.hash(password, 10);

      const result = await authService.comparePassword('wrongpassword', hashed);
      expect(result).toBe(false);
    });
  });
});

