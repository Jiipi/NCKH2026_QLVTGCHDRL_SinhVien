/**
 * Tests for Semester Validation Middleware
 * Task 2.4: Write unit tests for semester middleware
 * Validates: Requirements 3.1, 3.2, 3.3, 3.4, 3.5, 3.6, 8.1, 8.2, 10.2
 */

import { Request, Response, NextFunction } from 'express';
import { validateAndInjectSemester, AuthenticatedRequest } from './semesterMiddleware';
import { getCurrentSemester } from '../../core/utils/semester';

// Mock dependencies
jest.mock('../../core/utils/semester');
jest.mock('../../business/services/semesterClosure.service');
jest.mock('../../core/logger');

const mockGetCurrentSemester = getCurrentSemester as jest.MockedFunction<typeof getCurrentSemester>;

describe('Semester Validation Middleware', () => {
  let req: Partial<AuthenticatedRequest>;
  let res: Partial<Response>;
  let next: NextFunction;
  let jsonMock: jest.Mock;
  let statusMock: jest.Mock;

  beforeEach(() => {
    // Setup mock response
    jsonMock = jest.fn();
    statusMock = jest.fn().mockReturnValue({ json: jsonMock });
    
    req = {
      query: {},
      method: 'GET',
      path: '/core/activities',
      user: undefined
    };
    
    res = {
      status: statusMock,
      json: jsonMock
    };
    
    next = jest.fn();

    // Mock current semester
    mockGetCurrentSemester.mockReturnValue({
      semester: 'hoc_ky_1',
      year: '2025',
      value: 'hoc_ky_1_2025',
      display: 'Học kỳ 1 năm 2025'
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('Requirement 3.1: Valid semester parsing (Task 2.1)', () => {
    it('should parse valid semester format hoc_ky_1_2025', async () => {
      // Arrange
      req.user = { sub: 'admin-123', role: 'ADMIN' };
      req.query = { semester: 'hoc_ky_1_2025' };

      const { parseSemesterString } = require('../../core/utils/semester');
      parseSemesterString.mockReturnValue({
        semester: 'hoc_ky_1',
        year: '2025',
        value: 'hoc_ky_1_2025',
        display: 'Học kỳ 1 năm 2025'
      });

      // Act
      const middleware = validateAndInjectSemester();
      await middleware(req as AuthenticatedRequest, res as Response, next);

      // Assert
      expect(parseSemesterString).toHaveBeenCalledWith('hoc_ky_1_2025');
      expect(req.semester).toEqual({
        hoc_ky: 'hoc_ky_1',
        nam_hoc: '2025',
        key: 'hoc_ky_1_2025'
      });
      expect(next).toHaveBeenCalled();
      expect(statusMock).not.toHaveBeenCalledWith(400);
    });

    it('should parse valid semester format hoc_ky_2_2024', async () => {
      // Arrange
      req.user = { sub: 'admin-123', role: 'ADMIN' };
      req.query = { semester: 'hoc_ky_2_2024' };

      const { parseSemesterString } = require('../../core/utils/semester');
      parseSemesterString.mockReturnValue({
        semester: 'hoc_ky_2',
        year: '2024',
        value: 'hoc_ky_2_2024',
        display: 'Học kỳ 2 năm 2024'
      });

      // Act
      const middleware = validateAndInjectSemester();
      await middleware(req as AuthenticatedRequest, res as Response, next);

      // Assert
      expect(parseSemesterString).toHaveBeenCalledWith('hoc_ky_2_2024');
      expect(req.semester).toEqual({
        hoc_ky: 'hoc_ky_2',
        nam_hoc: '2024',
        key: 'hoc_ky_2_2024'
      });
      expect(next).toHaveBeenCalled();
    });

    it('should accept semester from semesterValue query param', async () => {
      // Arrange
      req.user = { sub: 'admin-123', role: 'ADMIN' };
      req.query = { semesterValue: 'hoc_ky_1_2025' };

      const { parseSemesterString } = require('../../core/utils/semester');
      parseSemesterString.mockReturnValue({
        semester: 'hoc_ky_1',
        year: '2025',
        value: 'hoc_ky_1_2025',
        display: 'Học kỳ 1 năm 2025'
      });

      // Act
      const middleware = validateAndInjectSemester();
      await middleware(req as AuthenticatedRequest, res as Response, next);

      // Assert
      expect(parseSemesterString).toHaveBeenCalledWith('hoc_ky_1_2025');
      expect(req.semester).toBeDefined();
      expect(next).toHaveBeenCalled();
    });
  });

  describe('Requirement 8.2: Invalid semester format returns 400 (Task 2.1)', () => {
    it('should return 400 for invalid semester format', async () => {
      // Arrange
      req.user = { sub: 'admin-123', role: 'ADMIN' };
      req.query = { semester: 'invalid_format' };

      const { parseSemesterString } = require('../../core/utils/semester');
      parseSemesterString.mockReturnValue(null); // Invalid format

      // Act
      const middleware = validateAndInjectSemester();
      await middleware(req as AuthenticatedRequest, res as Response, next);

      // Assert
      expect(statusMock).toHaveBeenCalledWith(400);
      expect(jsonMock).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          message: 'Semester must be in format: hoc_ky_1_2025 or hoc_ky_2_2025',
          statusCode: 'INVALID_SEMESTER_FORMAT'
        })
      );
      expect(next).not.toHaveBeenCalled();
    });

    it('should return 400 when parseSemesterString returns null value', async () => {
      // Arrange
      req.user = { sub: 'student-123', role: 'SINH_VIEN' };
      req.query = { semester: 'hoc_ky_3_2025' }; // Invalid semester number

      const { parseSemesterString } = require('../../core/utils/semester');
      parseSemesterString.mockReturnValue({
        semester: 'hoc_ky_3',
        year: '2025',
        value: null, // Invalid - no value
        display: null
      });

      // Act
      const middleware = validateAndInjectSemester();
      await middleware(req as AuthenticatedRequest, res as Response, next);

      // Assert
      expect(statusMock).toHaveBeenCalledWith(400);
      expect(jsonMock).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          message: 'Semester must be in format: hoc_ky_1_2025 or hoc_ky_2_2025',
          statusCode: 'INVALID_SEMESTER_FORMAT'
        })
      );
      expect(next).not.toHaveBeenCalled();
    });

    it('should return 400 for malformed semester string', async () => {
      // Arrange
      req.user = { sub: 'teacher-123', role: 'GIANG_VIEN' };
      req.query = { semester: '2025_hoc_ky_1' }; // Wrong order

      const { parseSemesterString } = require('../../core/utils/semester');
      parseSemesterString.mockReturnValue(null);

      // Act
      const middleware = validateAndInjectSemester();
      await middleware(req as AuthenticatedRequest, res as Response, next);

      // Assert
      expect(statusMock).toHaveBeenCalledWith(400);
      expect(jsonMock).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          statusCode: 'INVALID_SEMESTER_FORMAT'
        })
      );
      expect(next).not.toHaveBeenCalled();
    });
  });

  describe('Requirement 3.4, 3.6: Semester injection when not provided (Task 2.1)', () => {
    it('should inject current semester when no semester parameter provided', async () => {
      // Arrange
      req.user = { sub: 'student-123', role: 'SINH_VIEN' };
      req.query = {}; // No semester parameter

      // Act
      const middleware = validateAndInjectSemester();
      await middleware(req as AuthenticatedRequest, res as Response, next);

      // Assert
      expect(mockGetCurrentSemester).toHaveBeenCalled();
      expect(req.semester).toEqual({
        hoc_ky: 'hoc_ky_1',
        nam_hoc: '2025',
        key: 'hoc_ky_1_2025'
      });
      expect(next).toHaveBeenCalled();
    });

    it('should inject current semester for admin when no parameter provided', async () => {
      // Arrange
      req.user = { sub: 'admin-123', role: 'ADMIN' };
      req.query = {}; // No semester parameter

      // Act
      const middleware = validateAndInjectSemester();
      await middleware(req as AuthenticatedRequest, res as Response, next);

      // Assert
      expect(mockGetCurrentSemester).toHaveBeenCalled();
      expect(req.semester).toEqual({
        hoc_ky: 'hoc_ky_1',
        nam_hoc: '2025',
        key: 'hoc_ky_1_2025'
      });
      expect(next).toHaveBeenCalled();
    });

    it('should inject current semester for teacher when no parameter provided', async () => {
      // Arrange
      req.user = { sub: 'teacher-123', role: 'GIANG_VIEN' };
      req.query = {}; // No semester parameter

      // Act
      const middleware = validateAndInjectSemester();
      await middleware(req as AuthenticatedRequest, res as Response, next);

      // Assert
      expect(mockGetCurrentSemester).toHaveBeenCalled();
      expect(req.semester).toBeDefined();
      expect(req.semester?.key).toBe('hoc_ky_1_2025');
      expect(next).toHaveBeenCalled();
    });
  });

  describe('Requirement 3.2: Non-admin semester access control', () => {
    it('should allow ADMIN to access any semester', async () => {
      // Arrange
      req.user = { sub: 'admin-123', role: 'ADMIN' };
      req.query = { semester: 'hoc_ky_2_2024' }; // Different from current

      // Mock parseSemesterString to return the requested semester
      const { parseSemesterString } = require('../../core/utils/semester');
      parseSemesterString.mockReturnValue({
        semester: 'hoc_ky_2',
        year: '2024',
        value: 'hoc_ky_2_2024',
        display: 'Học kỳ 2 năm 2024'
      });

      // Act
      const middleware = validateAndInjectSemester();
      await middleware(req as AuthenticatedRequest, res as Response, next);

      // Assert
      expect(next).toHaveBeenCalled();
      expect(statusMock).not.toHaveBeenCalledWith(403);
      expect(req.semester).toEqual({
        hoc_ky: 'hoc_ky_2',
        nam_hoc: '2024',
        key: 'hoc_ky_2_2024'
      });
    });

    it('should reject non-admin accessing different semester with 403', async () => {
      // Arrange
      req.user = { sub: 'student-123', role: 'SINH_VIEN' };
      req.query = { semester: 'hoc_ky_2_2024' }; // Different from current (hoc_ky_1_2025)

      // Mock parseSemesterString
      const { parseSemesterString } = require('../../core/utils/semester');
      parseSemesterString.mockReturnValue({
        semester: 'hoc_ky_2',
        year: '2024',
        value: 'hoc_ky_2_2024',
        display: 'Học kỳ 2 năm 2024'
      });

      // Act
      const middleware = validateAndInjectSemester();
      await middleware(req as AuthenticatedRequest, res as Response, next);

      // Assert
      expect(statusMock).toHaveBeenCalledWith(403);
      expect(jsonMock).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          message: 'Bạn chỉ có thể truy cập học kỳ hiện tại',
          errors: { code: 'SEMESTER_ACCESS_DENIED' }
        })
      );
      expect(next).not.toHaveBeenCalled();
    });

    it('should allow non-admin accessing current semester', async () => {
      // Arrange
      req.user = { sub: 'student-123', role: 'SINH_VIEN' };
      req.query = { semester: 'hoc_ky_1_2025' }; // Same as current

      // Mock parseSemesterString
      const { parseSemesterString } = require('../../core/utils/semester');
      parseSemesterString.mockReturnValue({
        semester: 'hoc_ky_1',
        year: '2025',
        value: 'hoc_ky_1_2025',
        display: 'Học kỳ 1 năm 2025'
      });

      // Act
      const middleware = validateAndInjectSemester();
      await middleware(req as AuthenticatedRequest, res as Response, next);

      // Assert
      expect(next).toHaveBeenCalled();
      expect(statusMock).not.toHaveBeenCalledWith(403);
    });

    it('should reject GIANG_VIEN accessing different semester', async () => {
      // Arrange
      req.user = { sub: 'teacher-123', role: 'GIANG_VIEN' };
      req.query = { semester: 'hoc_ky_2_2024' };

      // Mock parseSemesterString
      const { parseSemesterString } = require('../../core/utils/semester');
      parseSemesterString.mockReturnValue({
        semester: 'hoc_ky_2',
        year: '2024',
        value: 'hoc_ky_2_2024',
        display: 'Học kỳ 2 năm 2024'
      });

      // Act
      const middleware = validateAndInjectSemester();
      await middleware(req as AuthenticatedRequest, res as Response, next);

      // Assert
      expect(statusMock).toHaveBeenCalledWith(403);
      expect(jsonMock).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          message: 'Bạn chỉ có thể truy cập học kỳ hiện tại',
          errors: { code: 'SEMESTER_ACCESS_DENIED' }
        })
      );
    });

    it('should reject LOP_TRUONG accessing different semester', async () => {
      // Arrange
      req.user = { sub: 'monitor-123', role: 'LOP_TRUONG' };
      req.query = { semester: 'hoc_ky_2_2024' };

      // Mock parseSemesterString
      const { parseSemesterString } = require('../../core/utils/semester');
      parseSemesterString.mockReturnValue({
        semester: 'hoc_ky_2',
        year: '2024',
        value: 'hoc_ky_2_2024',
        display: 'Học kỳ 2 năm 2024'
      });

      // Act
      const middleware = validateAndInjectSemester();
      await middleware(req as AuthenticatedRequest, res as Response, next);

      // Assert
      expect(statusMock).toHaveBeenCalledWith(403);
      expect(jsonMock).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          message: 'Bạn chỉ có thể truy cập học kỳ hiện tại',
          errors: { code: 'SEMESTER_ACCESS_DENIED' }
        })
      );
    });
  });

  describe('Requirement 10.2: Prevent semester data leaks', () => {
    it('should prevent student from accessing past semester data', async () => {
      // Arrange
      req.user = { sub: 'student-456', role: 'SINH_VIEN' };
      req.query = { semester: 'hoc_ky_1_2024' }; // Past semester

      // Mock parseSemesterString
      const { parseSemesterString } = require('../../core/utils/semester');
      parseSemesterString.mockReturnValue({
        semester: 'hoc_ky_1',
        year: '2024',
        value: 'hoc_ky_1_2024',
        display: 'Học kỳ 1 năm 2024'
      });

      // Act
      const middleware = validateAndInjectSemester();
      await middleware(req as AuthenticatedRequest, res as Response, next);

      // Assert
      expect(statusMock).toHaveBeenCalledWith(403);
      expect(jsonMock).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          message: 'Bạn chỉ có thể truy cập học kỳ hiện tại',
          errors: { code: 'SEMESTER_ACCESS_DENIED' }
        })
      );
      expect(next).not.toHaveBeenCalled();
    });

    it('should prevent student from accessing future semester data', async () => {
      // Arrange
      req.user = { sub: 'student-789', role: 'SINH_VIEN' };
      req.query = { semester: 'hoc_ky_2_2025' }; // Future semester (current is hoc_ky_1_2025)

      // Mock parseSemesterString
      const { parseSemesterString } = require('../../core/utils/semester');
      parseSemesterString.mockReturnValue({
        semester: 'hoc_ky_2',
        year: '2025',
        value: 'hoc_ky_2_2025',
        display: 'Học kỳ 2 năm 2025'
      });

      // Act
      const middleware = validateAndInjectSemester();
      await middleware(req as AuthenticatedRequest, res as Response, next);

      // Assert
      expect(statusMock).toHaveBeenCalledWith(403);
      expect(jsonMock).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          message: 'Bạn chỉ có thể truy cập học kỳ hiện tại',
          errors: { code: 'SEMESTER_ACCESS_DENIED' }
        })
      );
      expect(next).not.toHaveBeenCalled();
    });
  });

  describe('Requirement 3.5: Semester lock enforcement (Task 2.3)', () => {
    beforeEach(() => {
      // Mock parseSemesterString to return current semester
      const { parseSemesterString } = require('../../core/utils/semester');
      parseSemesterString.mockReturnValue({
        semester: 'hoc_ky_1',
        year: '2025',
        value: 'hoc_ky_1_2025',
        display: 'Học kỳ 1 năm 2025'
      });
    });

    it('should check semester lock for write operations (POST)', async () => {
      // Arrange
      req.user = { sub: 'student-123', role: 'SINH_VIEN' };
      req.query = { semester: 'hoc_ky_1_2025' };
      req.method = 'POST'; // Write operation

      const { SemesterClosureService } = require('../../business/services/semesterClosure.service');
      SemesterClosureService.enforceWritableForUserSemesterOrThrow = jest.fn().mockResolvedValue(undefined);

      // Act
      const middleware = validateAndInjectSemester();
      await middleware(req as AuthenticatedRequest, res as Response, next);

      // Assert
      expect(SemesterClosureService.enforceWritableForUserSemesterOrThrow).toHaveBeenCalledWith({
        userId: 'student-123',
        hoc_ky: 'hoc_ky_1',
        nam_hoc: '2025-2026', // Converted to double year format
        userRole: 'SINH_VIEN'
      });
      expect(next).toHaveBeenCalled();
    });

    it('should check semester lock for write operations (PUT)', async () => {
      // Arrange
      req.user = { sub: 'student-456', role: 'SINH_VIEN' };
      req.query = { semester: 'hoc_ky_1_2025' };
      req.method = 'PUT'; // Write operation

      const { SemesterClosureService } = require('../../business/services/semesterClosure.service');
      SemesterClosureService.enforceWritableForUserSemesterOrThrow = jest.fn().mockResolvedValue(undefined);

      // Act
      const middleware = validateAndInjectSemester();
      await middleware(req as AuthenticatedRequest, res as Response, next);

      // Assert
      expect(SemesterClosureService.enforceWritableForUserSemesterOrThrow).toHaveBeenCalled();
      expect(next).toHaveBeenCalled();
    });

    it('should check semester lock for write operations (DELETE)', async () => {
      // Arrange
      req.user = { sub: 'student-789', role: 'SINH_VIEN' };
      req.query = { semester: 'hoc_ky_1_2025' };
      req.method = 'DELETE'; // Write operation

      const { SemesterClosureService } = require('../../business/services/semesterClosure.service');
      SemesterClosureService.enforceWritableForUserSemesterOrThrow = jest.fn().mockResolvedValue(undefined);

      // Act
      const middleware = validateAndInjectSemester();
      await middleware(req as AuthenticatedRequest, res as Response, next);

      // Assert
      expect(SemesterClosureService.enforceWritableForUserSemesterOrThrow).toHaveBeenCalled();
      expect(next).toHaveBeenCalled();
    });

    it('should NOT check semester lock for read operations (GET)', async () => {
      // Arrange
      req.user = { sub: 'student-123', role: 'SINH_VIEN' };
      req.query = { semester: 'hoc_ky_1_2025' };
      req.method = 'GET'; // Read operation

      const { SemesterClosureService } = require('../../business/services/semesterClosure.service');
      SemesterClosureService.enforceWritableForUserSemesterOrThrow = jest.fn();

      // Act
      const middleware = validateAndInjectSemester();
      await middleware(req as AuthenticatedRequest, res as Response, next);

      // Assert
      expect(SemesterClosureService.enforceWritableForUserSemesterOrThrow).not.toHaveBeenCalled();
      expect(next).toHaveBeenCalled();
    });

    it('should return 423 SEMESTER_LOCKED when semester is locked', async () => {
      // Arrange
      req.user = { sub: 'student-123', role: 'SINH_VIEN' };
      req.query = { semester: 'hoc_ky_1_2025' };
      req.method = 'POST';

      const { SemesterClosureService } = require('../../business/services/semesterClosure.service');
      const lockError = Object.assign(new Error('SEMESTER_CLOSED_LOCKED_SOFT'), {
        status: 423,
        details: {
          classId: 'class-123',
          semester: 'hoc_ky_1_2025',
          state: 'LOCKED_SOFT'
        }
      });
      SemesterClosureService.enforceWritableForUserSemesterOrThrow = jest.fn().mockRejectedValue(lockError);

      // Act
      const middleware = validateAndInjectSemester();
      await middleware(req as AuthenticatedRequest, res as Response, next);

      // Assert
      expect(statusMock).toHaveBeenCalledWith(423);
      expect(jsonMock).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          message: 'Học kỳ này đã bị khóa',
          statusCode: 'SEMESTER_LOCKED',
          errors: {
            classId: 'class-123',
            semester: 'hoc_ky_1_2025',
            state: 'LOCKED_SOFT'
          }
        })
      );
      expect(next).not.toHaveBeenCalled();
    });

    it('should bypass semester lock check for ADMIN users', async () => {
      // Arrange
      req.user = { sub: 'admin-123', role: 'ADMIN' };
      req.query = { semester: 'hoc_ky_1_2025' };
      req.method = 'POST'; // Write operation

      const { SemesterClosureService } = require('../../business/services/semesterClosure.service');
      SemesterClosureService.enforceWritableForUserSemesterOrThrow = jest.fn();

      // Act
      const middleware = validateAndInjectSemester();
      await middleware(req as AuthenticatedRequest, res as Response, next);

      // Assert
      expect(SemesterClosureService.enforceWritableForUserSemesterOrThrow).not.toHaveBeenCalled();
      expect(next).toHaveBeenCalled();
    });

    it('should convert hoc_ky_2 year format correctly (previous year)', async () => {
      // Arrange
      req.user = { sub: 'student-123', role: 'SINH_VIEN' };
      req.query = { semester: 'hoc_ky_2_2025' };
      req.method = 'POST';

      // Mock parseSemesterString for hoc_ky_2
      const { parseSemesterString } = require('../../core/utils/semester');
      parseSemesterString.mockReturnValue({
        semester: 'hoc_ky_2',
        year: '2025',
        value: 'hoc_ky_2_2025',
        display: 'Học kỳ 2 năm 2025'
      });

      // Mock current semester to match
      mockGetCurrentSemester.mockReturnValue({
        semester: 'hoc_ky_2',
        year: '2025',
        value: 'hoc_ky_2_2025',
        display: 'Học kỳ 2 năm 2025'
      });

      const { SemesterClosureService } = require('../../business/services/semesterClosure.service');
      SemesterClosureService.enforceWritableForUserSemesterOrThrow = jest.fn().mockResolvedValue(undefined);

      // Act
      const middleware = validateAndInjectSemester();
      await middleware(req as AuthenticatedRequest, res as Response, next);

      // Assert
      expect(SemesterClosureService.enforceWritableForUserSemesterOrThrow).toHaveBeenCalledWith({
        userId: 'student-123',
        hoc_ky: 'hoc_ky_2',
        nam_hoc: '2024-2025', // hoc_ky_2 uses previous year: 2025 -> 2024-2025
        userRole: 'SINH_VIEN'
      });
      expect(next).toHaveBeenCalled();
    });

    it('should handle semester lock check errors gracefully', async () => {
      // Arrange
      req.user = { sub: 'student-123', role: 'SINH_VIEN' };
      req.query = { semester: 'hoc_ky_1_2025' };
      req.method = 'POST';

      const { SemesterClosureService } = require('../../business/services/semesterClosure.service');
      const unexpectedError = new Error('Database connection failed');
      SemesterClosureService.enforceWritableForUserSemesterOrThrow = jest.fn().mockRejectedValue(unexpectedError);

      const { logError } = require('../../core/logger');

      // Act
      const middleware = validateAndInjectSemester();
      await middleware(req as AuthenticatedRequest, res as Response, next);

      // Assert - Should log error but not block the request
      expect(logError).toHaveBeenCalledWith('Semester lock check failed', unexpectedError);
      expect(next).toHaveBeenCalled(); // Request continues despite error
      expect(statusMock).not.toHaveBeenCalledWith(423);
    });
  });
});
