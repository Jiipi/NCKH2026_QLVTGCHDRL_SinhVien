/**
 * Unit Tests for GetPointsSummaryUseCase
 * Tests scope filtering and semester handling
 */

import GetPointsSummaryUseCase from './GetPointsSummaryUseCase';
import type { IPointsRepository } from '../interfaces/IPointsRepository';

// Mock repository
const mockRepository: jest.Mocked<IPointsRepository> = {
  findStudentByUserId: jest.fn(),
  findAttendedRegistrations: jest.fn(),
  findAllRegistrations: jest.fn(),
  getRegistrationStatusCounts: jest.fn(),
  findRegistrationsWithPagination: jest.fn(),
  findAttendanceRecords: jest.fn(),
  getUniqueSemesters: jest.fn(),
  getUniqueAcademicYears: jest.fn(),
  findCompletedRegistrationsForSemester: jest.fn(),
};

describe('GetPointsSummaryUseCase', () => {
  let useCase: GetPointsSummaryUseCase;

  beforeEach(() => {
    useCase = new GetPointsSummaryUseCase(mockRepository);
    jest.clearAllMocks();
  });

  describe('execute with scope', () => {
    it('should merge semester from middleware with filters', async () => {
      // Arrange
      const userId = 'user-123';
      const filters = { semester: 'hoc_ky_2_2024' }; // This should be overridden
      const scope = {
        where: { lop_id: 'class-A' },
        permissions: { canCreate: false, canUpdate: false, canDelete: false, canApprove: false }
      };
      const semester = {
        hoc_ky: 'hoc_ky_1',
        nam_hoc: '2025-2026'
      };

      mockRepository.findStudentByUserId.mockResolvedValue({
        id: 1,
        mssv: 'SV001',
        nguoi_dung_id: userId,
        nguoi_dung: { ho_ten: 'Test', email: 'test@test.com' },
        lop: { ten_lop: 'Class A', khoa: 'IT', nien_khoa: '2024' }
      } as any);

      mockRepository.findAttendedRegistrations.mockResolvedValue([]);
      mockRepository.findAllRegistrations.mockResolvedValue([]);
      mockRepository.getRegistrationStatusCounts.mockResolvedValue([]);

      // Act
      await useCase.execute(userId, filters, scope, semester);

      // Assert
      expect(mockRepository.findAttendedRegistrations).toHaveBeenCalledWith(
        1,
        expect.objectContaining({
          semester: 'hoc_ky_1_2025' // Should use middleware semester
        })
      );
    });

    it('should calculate points correctly', async () => {
      // Arrange
      const userId = 'user-123';

      mockRepository.findStudentByUserId.mockResolvedValue({
        id: 1,
        mssv: 'SV001',
        nguoi_dung_id: userId,
        nguoi_dung: { ho_ten: 'Test', email: 'test@test.com' },
        lop: { ten_lop: 'Class A', khoa: 'IT', nien_khoa: '2024' }
      } as any);

      mockRepository.findAttendedRegistrations.mockResolvedValue([
        {
          id: 'reg-1',
          ngay_dang_ky: new Date(),
          trang_thai_dk: 'da_tham_gia',
          hoat_dong: {
            id: 'act-1',
            ten_hd: 'Activity 1',
            diem_rl: 10,
            loai_hd: { ten_loai_hd: 'Type 1', diem_mac_dinh: 5 }
          }
        },
        {
          id: 'reg-2',
          ngay_dang_ky: new Date(),
          trang_thai_dk: 'da_tham_gia',
          hoat_dong: {
            id: 'act-2',
            ten_hd: 'Activity 2',
            diem_rl: 0, // Should use diem_mac_dinh
            loai_hd: { ten_loai_hd: 'Type 2', diem_mac_dinh: 8 }
          }
        }
      ] as any);

      mockRepository.findAllRegistrations.mockResolvedValue([]);
      mockRepository.getRegistrationStatusCounts.mockResolvedValue([]);

      // Act
      const result = await useCase.execute(userId, {});

      // Assert
      expect(result).toHaveProperty('thong_ke');
      const thongKe = (result as any).thong_ke;
      expect(thongKe.tong_diem).toBe(18); // 10 + 8
      expect(thongKe.tong_hoat_dong).toBe(2);
    });

    it('should group points by activity type', async () => {
      // Arrange
      const userId = 'user-123';

      mockRepository.findStudentByUserId.mockResolvedValue({
        id: 1,
        mssv: 'SV001',
        nguoi_dung_id: userId,
        nguoi_dung: { ho_ten: 'Test', email: 'test@test.com' },
        lop: { ten_lop: 'Class A', khoa: 'IT', nien_khoa: '2024' }
      } as any);

      mockRepository.findAttendedRegistrations.mockResolvedValue([
        {
          id: 'reg-1',
          ngay_dang_ky: new Date(),
          trang_thai_dk: 'da_tham_gia',
          hoat_dong: {
            id: 'act-1',
            ten_hd: 'Activity 1',
            diem_rl: 10,
            loai_hd: { ten_loai_hd: 'Văn hóa', diem_mac_dinh: 5 }
          }
        },
        {
          id: 'reg-2',
          ngay_dang_ky: new Date(),
          trang_thai_dk: 'da_tham_gia',
          hoat_dong: {
            id: 'act-2',
            ten_hd: 'Activity 2',
            diem_rl: 15,
            loai_hd: { ten_loai_hd: 'Văn hóa', diem_mac_dinh: 8 }
          }
        },
        {
          id: 'reg-3',
          ngay_dang_ky: new Date(),
          trang_thai_dk: 'da_tham_gia',
          hoat_dong: {
            id: 'act-3',
            ten_hd: 'Activity 3',
            diem_rl: 20,
            loai_hd: { ten_loai_hd: 'Thể thao', diem_mac_dinh: 10 }
          }
        }
      ] as any);

      mockRepository.findAllRegistrations.mockResolvedValue([]);
      mockRepository.getRegistrationStatusCounts.mockResolvedValue([]);

      // Act
      const result = await useCase.execute(userId, {});

      // Assert
      const thongKe = (result as any).thong_ke;
      expect(thongKe.diem_theo_loai).toHaveLength(2);
      
      const vanHoa = thongKe.diem_theo_loai.find((t: any) => t.ten_loai === 'Văn hóa');
      expect(vanHoa.so_hoat_dong).toBe(2);
      expect(vanHoa.tong_diem).toBe(25); // 10 + 15

      const theThao = thongKe.diem_theo_loai.find((t: any) => t.ten_loai === 'Thể thao');
      expect(theThao.so_hoat_dong).toBe(1);
      expect(theThao.tong_diem).toBe(20);
    });

    it('should throw NotFoundError when student not found', async () => {
      // Arrange
      const userId = 'non-existent';

      mockRepository.findStudentByUserId.mockResolvedValue(null);

      // Act & Assert
      await expect(useCase.execute(userId, {})).rejects.toThrow('Không tìm thấy thông tin sinh viên');
    });

    it('should work without scope (backward compatible)', async () => {
      // Arrange
      const userId = 'user-123';
      const filters = { semester: 'hoc_ky_1_2025' };

      mockRepository.findStudentByUserId.mockResolvedValue({
        id: 1,
        mssv: 'SV001',
        nguoi_dung_id: userId,
        nguoi_dung: { ho_ten: 'Test', email: 'test@test.com' },
        lop: { ten_lop: 'Class A', khoa: 'IT', nien_khoa: '2024' }
      } as any);

      mockRepository.findAttendedRegistrations.mockResolvedValue([]);
      mockRepository.findAllRegistrations.mockResolvedValue([]);
      mockRepository.getRegistrationStatusCounts.mockResolvedValue([]);

      // Act
      const result = await useCase.execute(userId, filters);

      // Assert
      expect(result).toBeDefined();
      expect(mockRepository.findAttendedRegistrations).toHaveBeenCalledWith(1, filters);
    });
  });
});
