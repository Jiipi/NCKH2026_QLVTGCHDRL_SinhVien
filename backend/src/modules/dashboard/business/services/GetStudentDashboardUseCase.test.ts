/**
 * Unit Tests for GetStudentDashboardUseCase
 * Tests scope filtering and semester handling
 */

import GetStudentDashboardUseCase from './GetStudentDashboardUseCase';
import type { IDashboardRepository } from '../interfaces/IDashboardRepository';
import type { StudentDashboardQuery } from './GetStudentDashboardUseCase';

// Mock repository
const mockRepository: jest.Mocked<IDashboardRepository> = {
  getStudentInfo: jest.fn(),
  getClassStudents: jest.fn(),
  getActivityTypes: jest.fn(),
  getStudentRegistrations: jest.fn(),
  getUpcomingActivities: jest.fn(),
  getUnreadNotificationsCount: jest.fn(),
  getActivityStatsByTimeRange: jest.fn(),
  getTotalActivitiesCount: jest.fn(),
  getTotalRegistrationsCount: jest.fn(),
  getAdminOverviewStats: jest.fn(),
  getClassRegistrations: jest.fn(),
};

describe('GetStudentDashboardUseCase', () => {
  let useCase: GetStudentDashboardUseCase;

  beforeEach(() => {
    useCase = new GetStudentDashboardUseCase(mockRepository);
    jest.clearAllMocks();
  });

  describe('execute with scope', () => {
    it('should apply scope to activity filter', async () => {
      // Arrange
      const userId = 'user-123';
      const query: StudentDashboardQuery = {};
      const scope = {
        where: {
          lop_id: 'class-A',
          trang_thai: 'da_duyet'
        },
        permissions: {
          canCreate: false,
          canUpdate: false,
          canDelete: false,
          canApprove: false
        }
      };
      const semester = {
        hoc_ky: 'hoc_ky_1',
        nam_hoc: '2025-2026'
      };

      mockRepository.getStudentInfo.mockResolvedValue({
        id: 1,
        mssv: 'SV001',
        nguoi_dung_id: userId,
        lop_id: 'class-A',
        nguoi_dung: {
          ho_ten: 'Test Student',
          email: 'student@test.com'
        },
        lop: {
          id: 'class-A',
          ten_lop: 'Class A',
          khoa: 'IT',
          nien_khoa: '2024-2025',
          chu_nhiem: 'teacher-1'
        }
      } as any);

      mockRepository.getClassStudents.mockResolvedValue([]);
      mockRepository.getStudentRegistrations.mockResolvedValue([]);
      mockRepository.getUpcomingActivities.mockResolvedValue([]);
      mockRepository.getUnreadNotificationsCount.mockResolvedValue(0);
      mockRepository.getClassRegistrations.mockResolvedValue([]);

      // Act
      await useCase.execute(userId, query, scope, semester);

      // Assert
      expect(mockRepository.getStudentRegistrations).toHaveBeenCalledWith(
        1,
        expect.objectContaining({
          hoc_ky: 'hoc_ky_1',
          nam_hoc: '2025-2026',
          lop_id: 'class-A',
          trang_thai: 'da_duyet'
        })
      );
    });

    it('should prioritize semester from middleware over query', async () => {
      // Arrange
      const userId = 'user-123';
      const query: StudentDashboardQuery = {
        semester: 'hoc_ky_2_2024' // This should be ignored
      };
      const semester = {
        hoc_ky: 'hoc_ky_1',
        nam_hoc: '2025-2026' // This should be used
      };

      mockRepository.getStudentInfo.mockResolvedValue({
        id: 1,
        mssv: 'SV001',
        nguoi_dung_id: userId,
        lop_id: 'class-A',
        nguoi_dung: { ho_ten: 'Test', email: 'test@test.com' },
        lop: { id: 'class-A', ten_lop: 'A', khoa: 'IT', nien_khoa: '2024', chu_nhiem: null }
      } as any);

      mockRepository.getClassStudents.mockResolvedValue([]);
      mockRepository.getStudentRegistrations.mockResolvedValue([]);
      mockRepository.getUpcomingActivities.mockResolvedValue([]);
      mockRepository.getUnreadNotificationsCount.mockResolvedValue(0);
      mockRepository.getClassRegistrations.mockResolvedValue([]);

      // Act
      await useCase.execute(userId, query, undefined, semester);

      // Assert
      expect(mockRepository.getStudentRegistrations).toHaveBeenCalledWith(
        1,
        expect.objectContaining({
          hoc_ky: 'hoc_ky_1',
          nam_hoc: '2025-2026'
        })
      );
    });

    it('should work without scope (backward compatible)', async () => {
      // Arrange
      const userId = 'user-123';
      const query: StudentDashboardQuery = {
        semester: 'hoc_ky_1_2025'
      };

      mockRepository.getStudentInfo.mockResolvedValue({
        id: 1,
        mssv: 'SV001',
        nguoi_dung_id: userId,
        lop_id: 'class-A',
        nguoi_dung: { ho_ten: 'Test', email: 'test@test.com' },
        lop: { id: 'class-A', ten_lop: 'A', khoa: 'IT', nien_khoa: '2024', chu_nhiem: null }
      } as any);

      mockRepository.getClassStudents.mockResolvedValue([]);
      mockRepository.getStudentRegistrations.mockResolvedValue([]);
      mockRepository.getUpcomingActivities.mockResolvedValue([]);
      mockRepository.getUnreadNotificationsCount.mockResolvedValue(0);
      mockRepository.getClassRegistrations.mockResolvedValue([]);

      // Act
      const result = await useCase.execute(userId, query);

      // Assert
      expect(result).toBeDefined();
      expect(mockRepository.getStudentRegistrations).toHaveBeenCalled();
    });

    it('should throw NotFoundError when student not found', async () => {
      // Arrange
      const userId = 'non-existent';
      const query: StudentDashboardQuery = {};

      mockRepository.getStudentInfo.mockResolvedValue(null);

      // Act & Assert
      await expect(useCase.execute(userId, query)).rejects.toThrow('Không tìm thấy thông tin sinh viên');
    });

    it('should calculate total points correctly', async () => {
      // Arrange
      const userId = 'user-123';
      const query: StudentDashboardQuery = {};

      mockRepository.getStudentInfo.mockResolvedValue({
        id: 1,
        mssv: 'SV001',
        nguoi_dung_id: userId,
        lop_id: 'class-A',
        nguoi_dung: { ho_ten: 'Test', email: 'test@test.com' },
        lop: { id: 'class-A', ten_lop: 'A', khoa: 'IT', nien_khoa: '2024', chu_nhiem: null }
      } as any);

      mockRepository.getClassStudents.mockResolvedValue([]);
      mockRepository.getStudentRegistrations.mockResolvedValue([
        {
          id: 'reg-1',
          trang_thai_dk: 'da_tham_gia',
          ngay_dang_ky: new Date(),
          hoat_dong: {
            id: 'act-1',
            ten_hd: 'Activity 1',
            diem_rl: 10,
            ngay_bd: new Date(),
            loai_hd: { ten_loai_hd: 'Type 1', diem_mac_dinh: 5 }
          }
        },
        {
          id: 'reg-2',
          trang_thai_dk: 'da_duyet',
          ngay_dang_ky: new Date(),
          hoat_dong: {
            id: 'act-2',
            ten_hd: 'Activity 2',
            diem_rl: 15,
            ngay_bd: new Date(),
            loai_hd: { ten_loai_hd: 'Type 2', diem_mac_dinh: 8 }
          }
        }
      ] as any);

      mockRepository.getUpcomingActivities.mockResolvedValue([]);
      mockRepository.getUnreadNotificationsCount.mockResolvedValue(0);
      mockRepository.getClassRegistrations.mockResolvedValue([]);

      // Act
      const result = await useCase.execute(userId, query);

      // Assert
      expect(result.tong_quan.tong_diem).toBe(25); // 10 + 15
      expect(result.tong_quan.so_hoat_dong_da_tham_gia).toBe(2);
    });
  });
});
