import GetActivitiesUseCase from './GetActivitiesUseCase';
import type { HoatDong, Prisma, TrangThaiHoatDong } from '@prisma/client';

/**
 * Test suite for GetActivitiesUseCase - Task 7.2
 * Verifies that explicit status filters are still applied correctly
 */

// Mock repository interface
interface MockActivityRepository {
  findMany: jest.Mock;
  findStudentByUserId: jest.Mock;
  findRegistrationsByStudent: jest.Mock;
  findStudentsByClass: jest.Mock;
  findClassById: jest.Mock;
  countRegistrationsByClass: jest.Mock;
}

describe('GetActivitiesUseCase - Explicit Status Filters (Task 7.2)', () => {
  let useCase: GetActivitiesUseCase;
  let mockRepository: MockActivityRepository;

  beforeEach(() => {
    // Create mock repository
    mockRepository = {
      findMany: jest.fn(),
      findStudentByUserId: jest.fn(),
      findRegistrationsByStudent: jest.fn(),
      findStudentsByClass: jest.fn(),
      findClassById: jest.fn(),
      countRegistrationsByClass: jest.fn()
    };

    // Initialize use case with mock repository
    useCase = new GetActivitiesUseCase(mockRepository as any);
  });

  describe('Explicit status filter application', () => {
    it('should apply explicit status filter when provided by admin', async () => {
      // Arrange
      const dto = {
        status: 'cho_duyet',
        classId: 'class-123'
      };
      const user = {
        sub: 'admin-1',
        role: 'ADMIN'
      };

      mockRepository.findMany.mockResolvedValue({
        items: [],
        total: 0,
        page: 1,
        limit: 10
      });

      // Act
      await useCase.execute(dto, user);

      // Assert
      const whereClause = mockRepository.findMany.mock.calls[0][0];
      expect(whereClause.trang_thai).toBe('cho_duyet');
      expect(whereClause.lop_id).toBe('class-123');
    });

    it('should apply explicit status filter when provided by teacher', async () => {
      // Arrange
      const dto = {
        status: 'da_duyet'
      };
      const user = {
        sub: 'teacher-1',
        role: 'GIANG_VIEN'
      };

      mockRepository.findMany.mockResolvedValue({
        items: [],
        total: 0
      });

      // Act
      await useCase.execute(dto, user);

      // Assert
      const whereClause = mockRepository.findMany.mock.calls[0][0];
      expect(whereClause.trang_thai).toBe('da_duyet');
    });

    it('should apply explicit status filter when provided by student', async () => {
      // Arrange
      const dto = {
        status: 'ket_thuc'
      };
      const user = {
        sub: 'student-1',
        role: 'SINH_VIEN'
      };

      mockRepository.findMany.mockResolvedValue({
        items: [],
        total: 0
      });
      mockRepository.findStudentByUserId.mockResolvedValue(null);

      // Act
      await useCase.execute(dto, user);

      // Assert
      const whereClause = mockRepository.findMany.mock.calls[0][0];
      expect(whereClause.trang_thai).toBe('ket_thuc');
    });

    it('should NOT auto-add status filter for admin filtering by class without explicit status', async () => {
      // Arrange - This is the key test for Task 7.1 and 7.2
      const dto = {
        classId: 'class-123'
        // No status provided
      };
      const user = {
        sub: 'admin-1',
        role: 'ADMIN'
      };

      mockRepository.findMany.mockResolvedValue({
        items: [],
        total: 0
      });

      // Act
      await useCase.execute(dto, user);

      // Assert
      const whereClause = mockRepository.findMany.mock.calls[0][0];
      expect(whereClause.lop_id).toBe('class-123');
      expect(whereClause.trang_thai).toBeUndefined(); // No auto status filter
    });

    it('should apply explicit status filter even when filtering by class', async () => {
      // Arrange
      const dto = {
        classId: 'class-123',
        status: 'cho_duyet' // Explicit status
      };
      const user = {
        sub: 'admin-1',
        role: 'ADMIN'
      };

      mockRepository.findMany.mockResolvedValue({
        items: [],
        total: 0
      });

      // Act
      await useCase.execute(dto, user);

      // Assert
      const whereClause = mockRepository.findMany.mock.calls[0][0];
      expect(whereClause.lop_id).toBe('class-123');
      expect(whereClause.trang_thai).toBe('cho_duyet'); // Explicit status applied
    });
  });

  describe('Special time-based status filters', () => {
    it('should handle "open" status with time constraints', async () => {
      // Arrange
      const dto = {
        status: 'open'
      };
      const user = {
        sub: 'user-1',
        role: 'ADMIN'
      };

      mockRepository.findMany.mockResolvedValue({
        items: [],
        total: 0
      });

      // Act
      await useCase.execute(dto, user);

      // Assert
      const whereClause = mockRepository.findMany.mock.calls[0][0];
      expect(whereClause.trang_thai).toBe('da_duyet');
      expect(whereClause.han_dk).toBeDefined();
      expect(whereClause.ngay_bd).toBeDefined();
    });

    it('should handle "soon" status with time constraints', async () => {
      // Arrange
      const dto = {
        status: 'soon'
      };
      const user = {
        sub: 'user-1',
        role: 'ADMIN'
      };

      mockRepository.findMany.mockResolvedValue({
        items: [],
        total: 0
      });

      // Act
      await useCase.execute(dto, user);

      // Assert
      const whereClause = mockRepository.findMany.mock.calls[0][0];
      expect(whereClause.trang_thai).toBe('da_duyet');
      expect(whereClause.ngay_bd).toBeDefined();
      expect(whereClause.ngay_kt).toBeDefined();
    });

    it('should handle "closed" status with time constraints', async () => {
      // Arrange
      const dto = {
        status: 'closed'
      };
      const user = {
        sub: 'user-1',
        role: 'ADMIN'
      };

      mockRepository.findMany.mockResolvedValue({
        items: [],
        total: 0
      });

      // Act
      await useCase.execute(dto, user);

      // Assert
      const whereClause = mockRepository.findMany.mock.calls[0][0];
      expect(whereClause.ngay_kt).toBeDefined();
      expect(whereClause.ngay_kt.lt).toBeInstanceOf(Date);
    });
  });

  describe('Status filter with scope', () => {
    it('should apply explicit status filter alongside scope filter', async () => {
      // Arrange
      const dto = {
        status: 'da_duyet',
        scope: {
          activityFilter: {
            nguoi_tao_id: 'user-123'
          }
        }
      };
      const user = {
        sub: 'user-1',
        role: 'SINH_VIEN'
      };

      mockRepository.findMany.mockResolvedValue({
        items: [],
        total: 0
      });
      mockRepository.findStudentByUserId.mockResolvedValue(null);

      // Act
      await useCase.execute(dto, user);

      // Assert
      const whereClause = mockRepository.findMany.mock.calls[0][0];
      expect(whereClause.nguoi_tao_id).toBe('user-123'); // From scope
      expect(whereClause.trang_thai).toBe('da_duyet'); // From explicit status
    });
  });

  describe('All valid status values', () => {
    const validStatuses: TrangThaiHoatDong[] = ['cho_duyet', 'da_duyet', 'ket_thuc', 'tu_choi'];

    validStatuses.forEach(status => {
      it(`should apply explicit status filter for "${status}"`, async () => {
        // Arrange
        const dto = {
          status: status
        };
        const user = {
          sub: 'admin-1',
          role: 'ADMIN'
        };

        mockRepository.findMany.mockResolvedValue({
          items: [],
          total: 0
        });

        // Act
        await useCase.execute(dto, user);

        // Assert
        const whereClause = mockRepository.findMany.mock.calls[0][0];
        expect(whereClause.trang_thai).toBe(status);
      });
    });
  });
});
