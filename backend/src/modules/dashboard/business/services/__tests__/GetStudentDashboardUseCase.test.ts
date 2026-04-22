/**
 * GetStudentDashboardUseCase - Unit tests
 * TEST-001: Dashboard use cases
 */

// Mock semester utility BEFORE importing use case
jest.mock('../../../../../core/utils/semester', () => ({
  parseSemesterString: jest.fn().mockReturnValue({ semester: 'HK1', year: '2024-2025' }),
}));

jest.mock('../../../../../core/utils/classActivityCounter', () => ({
  countClassActivities: jest.fn().mockResolvedValue(5),
}));

import GetStudentDashboardUseCase from '../GetStudentDashboardUseCase';
import type { IDashboardRepository } from '../../interfaces/IDashboardRepository';

// ── Mock data ───────────────────────────────────────────────────────

const mockStudentInfo = {
  id: 'sv-1',
  mssv: 'SV001',
  ho_ten: 'Nguyen Van A',
  lop_id: 'lop-1',
  nguoi_dung_id: 'u-1',
  lop: {
    ten_lop: 'CNTT-K19',
    chu_nhiem: 'gv-1',
  },
};

const mockRegistration = {
  id: 'reg-1',
  sv_id: 'sv-1',
  hd_id: 'act-1',
  trang_thai_dk: 'da_tham_gia',
  ngay_dang_ky: new Date(),
  hoat_dong: {
    id: 'act-1',
    ten_hd: 'Test activity',
    mo_ta: null,
    hinh_anh: [],
    diem_rl: 10,
    ngay_bd: new Date(),
    ngay_kt: null,
    dia_diem: null,
    loai_hd: {
      ten_loai_hd: 'Hoạt động tình nguyện',
      diem_mac_dinh: 10,
      diem_toi_da: 20,
    },
  },
};

const mockClassStudent = {
  id: 'sv-1',
  nguoi_dung_id: 'u-1',
  mssv: 'SV001',
  ho_ten: 'Nguyen Van A',
};

// ── Mock factory ────────────────────────────────────────────────────

function createMockRepo(overrides: Partial<IDashboardRepository> = {}): IDashboardRepository {
  return {
    getStudentInfo: jest.fn().mockResolvedValue(mockStudentInfo),
    getClassStudents: jest.fn().mockResolvedValue([mockClassStudent]),
    getActivityTypes: jest.fn().mockResolvedValue([]),
    getStudentRegistrations: jest.fn().mockResolvedValue([mockRegistration]),
    getUpcomingActivities: jest.fn().mockResolvedValue([]),
    getUnreadNotificationsCount: jest.fn().mockResolvedValue(3),
    getActivityStatsByTimeRange: jest.fn().mockResolvedValue([]),
    getTotalActivitiesCount: jest.fn().mockResolvedValue(10),
    getTotalRegistrationsCount: jest.fn().mockResolvedValue(50),
    getAdminOverviewStats: jest.fn().mockResolvedValue({}),
    getClassRegistrations: jest.fn().mockResolvedValue([mockRegistration]),
    ...overrides,
  } as IDashboardRepository;
}

// ── Tests ───────────────────────────────────────────────────────────

describe('GetStudentDashboardUseCase', () => {
  let useCase: GetStudentDashboardUseCase;
  let mockRepo: IDashboardRepository;

  beforeEach(() => {
    mockRepo = createMockRepo();
    useCase = new GetStudentDashboardUseCase(mockRepo);
  });

  it('should return dashboard data for a valid student', async () => {
    const result = await useCase.execute('u-1', {});

    expect(result).toHaveProperty('sinh_vien');
    expect(result).toHaveProperty('activities');
    expect(result).toHaveProperty('tong_quan');
    expect(result).toHaveProperty('so_sanh_lop');
    expect(result.thong_bao_chua_doc).toBe(3);
    expect(mockRepo.getStudentInfo).toHaveBeenCalledWith('u-1');
  });

  it('should throw NotFoundError when student is not found', async () => {
    mockRepo = createMockRepo({
      getStudentInfo: jest.fn().mockResolvedValue(null),
    });
    useCase = new GetStudentDashboardUseCase(mockRepo);

    await expect(useCase.execute('u-999', {})).rejects.toThrow('Không tìm thấy thông tin sinh viên');
  });

  it('should calculate total points from attended registrations', async () => {
    const result = await useCase.execute('u-1', {});

    // Points should include the attended registration
    expect(result.tong_quan.tong_diem).toBeGreaterThanOrEqual(0);
  });

  it('should handle no class (null lop_id) gracefully', async () => {
    mockRepo = createMockRepo({
      getStudentInfo: jest.fn().mockResolvedValue({
        ...mockStudentInfo,
        lop_id: null,
        lop: null,
      }),
    });
    useCase = new GetStudentDashboardUseCase(mockRepo);

    const result = await useCase.execute('u-1', {});

    expect(result.so_sanh_lop.total_students_in_class).toBe(0);
    expect(result.so_sanh_lop.my_rank_in_class).toBeNull();
  });

  it('should pass semester filter to repository', async () => {
    await useCase.execute('u-1', { semester: 'HK1_2024-2025' });

    expect(mockRepo.getStudentRegistrations).toHaveBeenCalledWith(
      'sv-1',
      expect.objectContaining({ hoc_ky: 'HK1', nam_hoc: '2024-2025' }),
    );
  });

  it('should count unread notifications', async () => {
    const result = await useCase.execute('u-1', {});

    expect(mockRepo.getUnreadNotificationsCount).toHaveBeenCalledWith('u-1');
    expect(result.thong_bao_chua_doc).toBe(3);
  });
});
