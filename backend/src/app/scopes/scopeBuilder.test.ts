/**
 * Unit tests for scopeBuilder - Task 3.1: Fix buildStudentScope() to filter by lop_id
 * 
 * Tests verify that students see:
 * - Activities assigned to their class (lop_id match)
 * - Activities created by classmates (nguoi_tao_id match)
 */

import { buildScope } from './scopeBuilder';
import { prisma } from '../../data/infrastructure/prisma/client';

// Mock Prisma client
jest.mock('../../data/infrastructure/prisma/client', () => ({
  prisma: {
    sinhVien: {
      findUnique: jest.fn(),
      findMany: jest.fn()
    },
    lop: {
      findUnique: jest.fn(),
      findMany: jest.fn()
    }
  }
}));

describe('buildStudentScope - Task 3.1 Fix', () => {
  const mockStudentUser = {
    sub: 'student-user-id-1',
    role: 'SINH_VIEN'
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should include OR clause with lop_id filter for student activities scope', async () => {
    // Mock student data
    (prisma.sinhVien.findUnique as jest.Mock).mockResolvedValue({
      id: 'student-id-1',
      lop_id: 'class-a',
      nguoi_dung_id: 'student-user-id-1'
    });

    // Mock classmates
    (prisma.sinhVien.findMany as jest.Mock).mockResolvedValue([
      { nguoi_dung_id: 'student-user-id-1' },
      { nguoi_dung_id: 'student-user-id-2' }
    ]);

    // Mock class with homeroom teacher
    (prisma.lop.findUnique as jest.Mock).mockResolvedValue({
      id: 'class-a',
      chu_nhiem: 'teacher-user-id-1'
    });

    const scope = await buildScope('activities', mockStudentUser);

    // Verify OR clause exists
    expect(scope).toHaveProperty('OR');
    expect(Array.isArray(scope.OR)).toBe(true);
    expect(scope.OR).toHaveLength(2);

    // Verify lop_id filter is present
    expect(scope.OR[0]).toEqual({ lop_id: 'class-a' });

    // Verify nguoi_tao_id filter is present
    expect(scope.OR[1]).toHaveProperty('nguoi_tao_id');
    expect(scope.OR[1].nguoi_tao_id).toHaveProperty('in');
    expect(scope.OR[1].nguoi_tao_id.in).toContain('student-user-id-1');
    expect(scope.OR[1].nguoi_tao_id.in).toContain('student-user-id-2');
    expect(scope.OR[1].nguoi_tao_id.in).toContain('teacher-user-id-1');
  });

  it('should handle null lop_id gracefully', async () => {
    // Mock student with no class
    (prisma.sinhVien.findUnique as jest.Mock).mockResolvedValue({
      id: 'student-id-1',
      lop_id: null,
      nguoi_dung_id: 'student-user-id-1'
    });

    const scope = await buildScope('activities', mockStudentUser);

    // Should return a scope that matches nothing
    expect(scope).toEqual({ id: { equals: 'NEVER_MATCH' } });
  });

  it('should handle missing student record', async () => {
    // Mock no student found
    (prisma.sinhVien.findUnique as jest.Mock).mockResolvedValue(null);

    const scope = await buildScope('activities', mockStudentUser);

    // Should return a scope that matches nothing
    expect(scope).toEqual({ id: { equals: 'NEVER_MATCH' } });
  });

  it('should include homeroom teacher in creator list', async () => {
    // Mock student data
    (prisma.sinhVien.findUnique as jest.Mock).mockResolvedValue({
      id: 'student-id-1',
      lop_id: 'class-a',
      nguoi_dung_id: 'student-user-id-1'
    });

    // Mock classmates
    (prisma.sinhVien.findMany as jest.Mock).mockResolvedValue([
      { nguoi_dung_id: 'student-user-id-1' }
    ]);

    // Mock class with homeroom teacher
    (prisma.lop.findUnique as jest.Mock).mockResolvedValue({
      id: 'class-a',
      chu_nhiem: 'teacher-user-id-1'
    });

    const scope = await buildScope('activities', mockStudentUser);

    // Verify teacher is in creator list
    expect(scope.OR[1].nguoi_tao_id.in).toContain('teacher-user-id-1');
  });

  it('should work for LOP_TRUONG role as well', async () => {
    const mockMonitorUser = {
      sub: 'monitor-user-id-1',
      role: 'LOP_TRUONG'
    };

    // Mock student data
    (prisma.sinhVien.findUnique as jest.Mock).mockResolvedValue({
      id: 'student-id-1',
      lop_id: 'class-a',
      nguoi_dung_id: 'monitor-user-id-1'
    });

    // Mock classmates
    (prisma.sinhVien.findMany as jest.Mock).mockResolvedValue([
      { nguoi_dung_id: 'monitor-user-id-1' }
    ]);

    // Mock class
    (prisma.lop.findUnique as jest.Mock).mockResolvedValue({
      id: 'class-a',
      chu_nhiem: 'teacher-user-id-1'
    });

    const scope = await buildScope('activities', mockMonitorUser);

    // Should have same structure as student scope
    expect(scope).toHaveProperty('OR');
    expect(scope.OR[0]).toEqual({ lop_id: 'class-a' });
  });
});
