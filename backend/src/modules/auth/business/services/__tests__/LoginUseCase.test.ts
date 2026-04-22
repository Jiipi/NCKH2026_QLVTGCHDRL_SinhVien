/**
 * LoginUseCase - Unit tests
 * TEST-001: Auth use cases
 */

import LoginUseCase from '../LoginUseCase';
import { LoginDto } from '../../dto/LoginDto';

// ── Mock factories ──────────────────────────────────────────────────

const mockUser = {
  id: 'user-1',
  maso: 'SV001',
  email: 'sv001@test.edu',
  ho_ten: 'Nguyen Van A',
  mat_khau: '$2b$10$hashedpassword',
  trang_thai: 'hoat_dong',
  vai_tro: { ten_vt: 'Sinh viên', ma_vt: 'SINH_VIEN' },
  vai_tro_id: 'role-1',
};

function createMockRepo(overrides: Record<string, unknown> = {}) {
  return {
    findByEmailOrMaso: jest.fn().mockResolvedValue(mockUser),
    findUserByMaso: jest.fn(),
    findUserByEmail: jest.fn(),
    findUserById: jest.fn(),
    createUser: jest.fn(),
    updateUser: jest.fn().mockResolvedValue(mockUser),
    findRoleByName: jest.fn(),
    createRole: jest.fn(),
    createStudent: jest.fn(),
    countUsers: jest.fn(),
    ...overrides,
  };
}

function createMockHash(overrides: Record<string, unknown> = {}) {
  return {
    hash: jest.fn().mockResolvedValue('$2b$10$hashed'),
    compare: jest.fn().mockResolvedValue(true),
    ...overrides,
  };
}

function createMockToken() {
  return {
    generateToken: jest.fn().mockReturnValue('jwt-token-123'),
  };
}

function createMockOtp() {
  return {
    generateOtp: jest.fn(),
    verifyOtp: jest.fn(),
  };
}

// ── Tests ───────────────────────────────────────────────────────────

describe('LoginUseCase', () => {
  let useCase: LoginUseCase;
  let mockRepo: ReturnType<typeof createMockRepo>;
  let mockHash: ReturnType<typeof createMockHash>;
  let mockToken: ReturnType<typeof createMockToken>;

  beforeEach(() => {
    mockRepo = createMockRepo();
    mockHash = createMockHash();
    mockToken = createMockToken();
    const mockOtp = createMockOtp();

    useCase = new LoginUseCase(
      mockRepo as never,
      mockHash as never,
      mockToken as never,
      mockOtp as never,
    );
  });

  it('should return token and user on successful login', async () => {
    const dto = LoginDto.fromRequest({ maso: 'SV001', password: 'pass123' });

    const result = await useCase.execute(dto, '127.0.0.1');

    expect(result).toHaveProperty('token', 'jwt-token-123');
    expect(result).toHaveProperty('user');
    expect(mockRepo.findByEmailOrMaso).toHaveBeenCalledWith('SV001');
    expect(mockHash.compare).toHaveBeenCalledWith('pass123', mockUser.mat_khau);
    expect(mockToken.generateToken).toHaveBeenCalled();
  });

  it('should update last login time', async () => {
    const dto = LoginDto.fromRequest({ maso: 'SV001', password: 'pass123' });

    await useCase.execute(dto);

    expect(mockRepo.updateUser).toHaveBeenCalledWith(
      mockUser.id,
      expect.objectContaining({ lan_cuoi_dn: expect.any(Date) }),
    );
  });

  it('should throw UnauthorizedError when user is not found', async () => {
    mockRepo.findByEmailOrMaso.mockResolvedValue(null);
    const dto = LoginDto.fromRequest({ maso: 'INVALID', password: 'pass123' });

    await expect(useCase.execute(dto)).rejects.toThrow('Mã số hoặc mật khẩu không đúng');
  });

  it('should throw UnauthorizedError when password is wrong', async () => {
    mockHash.compare.mockResolvedValue(false);
    const dto = LoginDto.fromRequest({ maso: 'SV001', password: 'wrong' });

    await expect(useCase.execute(dto)).rejects.toThrow('Mã số hoặc mật khẩu không đúng');
  });

  it('should throw UnauthorizedError when account is locked', async () => {
    mockRepo.findByEmailOrMaso.mockResolvedValue({
      ...mockUser,
      trang_thai: 'khoa',
    });
    const dto = LoginDto.fromRequest({ maso: 'SV001', password: 'pass123' });

    await expect(useCase.execute(dto)).rejects.toThrow(/khóa/i);
  });

  it('should throw UnauthorizedError when account is inactive', async () => {
    mockRepo.findByEmailOrMaso.mockResolvedValue({
      ...mockUser,
      trang_thai: 'ngung',
    });
    const dto = LoginDto.fromRequest({ maso: 'SV001', password: 'pass123' });

    await expect(useCase.execute(dto)).rejects.toThrow(/không hoạt động/i);
  });

  it('should reject non-bcrypt password hashes', async () => {
    mockRepo.findByEmailOrMaso.mockResolvedValue({
      ...mockUser,
      mat_khau: 'plaintext-password',
    });
    const dto = LoginDto.fromRequest({ maso: 'SV001', password: 'plaintext-password' });

    await expect(useCase.execute(dto)).rejects.toThrow('Mã số hoặc mật khẩu không đúng');
  });

  it('should pass remember flag to token service', async () => {
    const dto = LoginDto.fromRequest({ maso: 'SV001', password: 'pass123', remember: true });

    await useCase.execute(dto);

    expect(mockToken.generateToken).toHaveBeenCalledWith(
      expect.anything(),
      true,
    );
  });

  it('should handle login without IP gracefully', async () => {
    const dto = LoginDto.fromRequest({ maso: 'SV001', password: 'pass123' });

    const result = await useCase.execute(dto, null);

    expect(result).toHaveProperty('token');
  });
});
