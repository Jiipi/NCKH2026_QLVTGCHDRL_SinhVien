/**
 * CreateRegistrationUseCase - Unit tests
 * TEST-001: Registration use cases
 */

import CreateRegistrationUseCase from '../CreateRegistrationUseCase';
import CreateRegistrationDto from '../../dto/CreateRegistrationDto';
import type { IRegistrationRepository, ActivityForRegistrationValidation } from '../../interfaces/IRegistrationRepository';

// ── Mock data ───────────────────────────────────────────────────────

const validActivity: ActivityForRegistrationValidation = {
  id: 'act-1',
  ten_hd: 'Hoạt động A',
  nguoi_tao_id: 'u-1',
  trang_thai: 'da_duyet',
  sl_toi_da: 100,
  han_dk: new Date(Date.now() + 86400000), // tomorrow
  ngay_bd: new Date(Date.now() + 172800000),
  _count: { dang_ky_hd: 10 },
};

const mockUser = { sub: 'user-1', role: 'SINH_VIEN' };

function createMockRepo(overrides: Partial<IRegistrationRepository> = {}): IRegistrationRepository {
  return {
    findMany: jest.fn().mockResolvedValue({ items: [], total: 0 }),
    findById: jest.fn(),
    findByUserAndActivity: jest.fn().mockResolvedValue(null),
    create: jest.fn().mockResolvedValue({ id: 'reg-1', trang_thai_dk: 'cho_duyet' }),
    update: jest.fn(),
    delete: jest.fn(),
    bulkApprove: jest.fn(),
    bulkReject: jest.fn(),
    checkIn: jest.fn(),
    findByUser: jest.fn(),
    getActivityStats: jest.fn(),
    findStudentByUserId: jest.fn(),
    findActivityForRegistrationValidation: jest.fn().mockResolvedValue(validActivity),
    findRegistrationsForExport: jest.fn(),
    ...overrides,
  } as IRegistrationRepository;
}

// ── Tests ───────────────────────────────────────────────────────────

describe('CreateRegistrationUseCase', () => {
  let useCase: CreateRegistrationUseCase;
  let mockRepo: IRegistrationRepository;

  beforeEach(() => {
    mockRepo = createMockRepo();
    useCase = new CreateRegistrationUseCase(mockRepo);
  });

  it('should create a registration successfully', async () => {
    const dto = new CreateRegistrationDto({ userId: 'sv-1', activityId: 'act-1' });

    const result = await useCase.execute(dto, mockUser as never);

    expect(result).toEqual(expect.objectContaining({ id: 'reg-1' }));
    expect(mockRepo.create).toHaveBeenCalledWith(
      expect.objectContaining({
        userId: 'sv-1',
        activityId: 'act-1',
        trang_thai_dk: 'cho_duyet',
      }),
    );
  });

  it('should throw ValidationError when activityId is missing', async () => {
    const dto = new CreateRegistrationDto({ userId: 'sv-1', activityId: '' });

    await expect(useCase.execute(dto, mockUser as never)).rejects.toThrow('activityId là bắt buộc');
  });

  it('should throw ValidationError when userId is missing', async () => {
    const dto = new CreateRegistrationDto({ userId: '', activityId: 'act-1' });

    await expect(useCase.execute(dto, mockUser as never)).rejects.toThrow('userId là bắt buộc');
  });

  it('should throw NotFoundError when activity does not exist', async () => {
    mockRepo = createMockRepo({
      findActivityForRegistrationValidation: jest.fn().mockResolvedValue(null),
    });
    useCase = new CreateRegistrationUseCase(mockRepo);
    const dto = new CreateRegistrationDto({ userId: 'sv-1', activityId: 'act-999' });

    await expect(useCase.execute(dto, mockUser as never)).rejects.toThrow('Hoạt động không tồn tại');
  });

  it('should throw ValidationError when activity is not approved', async () => {
    mockRepo = createMockRepo({
      findActivityForRegistrationValidation: jest.fn().mockResolvedValue({
        ...validActivity,
        trang_thai: 'cho_duyet',
      }),
    });
    useCase = new CreateRegistrationUseCase(mockRepo);
    const dto = new CreateRegistrationDto({ userId: 'sv-1', activityId: 'act-1' });

    await expect(useCase.execute(dto, mockUser as never)).rejects.toThrow('chưa được duyệt');
  });

  it('should throw ValidationError when max participants reached', async () => {
    mockRepo = createMockRepo({
      findActivityForRegistrationValidation: jest.fn().mockResolvedValue({
        ...validActivity,
        sl_toi_da: 10,
        _count: { dang_ky_hd: 10 },
      }),
    });
    useCase = new CreateRegistrationUseCase(mockRepo);
    const dto = new CreateRegistrationDto({ userId: 'sv-1', activityId: 'act-1' });

    await expect(useCase.execute(dto, mockUser as never)).rejects.toThrow('đã đủ số lượng');
  });

  it('should throw ValidationError when registration deadline passed', async () => {
    mockRepo = createMockRepo({
      findActivityForRegistrationValidation: jest.fn().mockResolvedValue({
        ...validActivity,
        han_dk: new Date(Date.now() - 86400000), // yesterday
      }),
    });
    useCase = new CreateRegistrationUseCase(mockRepo);
    const dto = new CreateRegistrationDto({ userId: 'sv-1', activityId: 'act-1' });

    await expect(useCase.execute(dto, mockUser as never)).rejects.toThrow('hết hạn');
  });

  it('should throw ValidationError when already registered', async () => {
    mockRepo = createMockRepo({
      findByUserAndActivity: jest.fn().mockResolvedValue({ id: 'reg-existing' }),
    });
    useCase = new CreateRegistrationUseCase(mockRepo);
    const dto = new CreateRegistrationDto({ userId: 'sv-1', activityId: 'act-1' });

    await expect(useCase.execute(dto, mockUser as never)).rejects.toThrow('đã đăng ký');
  });

  it('should allow registration when no participant limit set', async () => {
    mockRepo = createMockRepo({
      findActivityForRegistrationValidation: jest.fn().mockResolvedValue({
        ...validActivity,
        sl_toi_da: 0, // no limit
        _count: { dang_ky_hd: 9999 },
      }),
    });
    useCase = new CreateRegistrationUseCase(mockRepo);
    const dto = new CreateRegistrationDto({ userId: 'sv-1', activityId: 'act-1' });

    const result = await useCase.execute(dto, mockUser as never);
    expect(result).toEqual(expect.objectContaining({ id: 'reg-1' }));
  });
});
