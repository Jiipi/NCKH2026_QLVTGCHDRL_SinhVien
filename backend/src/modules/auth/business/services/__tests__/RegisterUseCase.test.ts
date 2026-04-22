/**
 * RegisterUseCase - Unit tests
 * TEST-001: Auth use cases
 */

import RegisterUseCase from '../RegisterUseCase';
import { RegisterDto } from '../../dto/RegisterDto';

// ── Mock data ───────────────────────────────────────────────────────

const studentRole = { id: 'role-sv', ten_vt: 'Sinh viên', ma_vt: 'SINH_VIEN' };

const createdUser = {
  id: 'user-new',
  maso: 'SV100',
  email: 'sv100@test.edu',
  ho_ten: 'Le Thi B',
  trang_thai: 'hoat_dong',
  vai_tro: studentRole,
  vai_tro_id: studentRole.id,
};

// ── Mock factories ──────────────────────────────────────────────────

function createMockRepo(overrides: Record<string, unknown> = {}) {
  return {
    findByEmailOrMaso: jest.fn(),
    findUserByMaso: jest.fn().mockResolvedValue(null),
    findUserByEmail: jest.fn().mockResolvedValue(null),
    findUserById: jest.fn(),
    findStudentByMssv: jest.fn().mockResolvedValue(null),
    createUser: jest.fn().mockResolvedValue(createdUser),
    updateUser: jest.fn(),
    findRoleByName: jest.fn().mockResolvedValue(studentRole),
    createRole: jest.fn(),
    createStudent: jest.fn().mockResolvedValue({ id: 'student-1', nguoi_dung_id: 'user-new' }),
    countUsers: jest.fn(),
    ...overrides,
  };
}

function createMockHash() {
  return {
    hash: jest.fn().mockResolvedValue('$2b$10$hashed'),
    compare: jest.fn(),
  };
}

function createMockToken() {
  return {
    generateToken: jest.fn().mockReturnValue('jwt-register-token'),
  };
}

// ── Tests ───────────────────────────────────────────────────────────

describe('RegisterUseCase', () => {
  let useCase: RegisterUseCase;
  let mockRepo: ReturnType<typeof createMockRepo>;
  let mockHash: ReturnType<typeof createMockHash>;
  let mockToken: ReturnType<typeof createMockToken>;

  beforeEach(() => {
    mockRepo = createMockRepo();
    mockHash = createMockHash();
    mockToken = createMockToken();

    useCase = new RegisterUseCase(
      mockRepo as never,
      mockHash as never,
      mockToken as never,
    );
  });

  it('should create user and return token on successful registration', async () => {
    const dto = RegisterDto.fromRequest({
      maso: 'SV100',
      email: 'sv100@test.edu',
      ho_ten: 'Le Thi B',
      password: 'Abc@1234',
      lop_id: 'lop-1',
    });

    const result = await useCase.execute(dto);

    expect(result).toHaveProperty('token', 'jwt-register-token');
    expect(result).toHaveProperty('user');
    expect(mockHash.hash).toHaveBeenCalledWith('Abc@1234');
    expect(mockRepo.createUser).toHaveBeenCalled();
    expect(mockToken.generateToken).toHaveBeenCalled();
  });

  it('should create student record when lop_id is provided', async () => {
    const dto = RegisterDto.fromRequest({
      maso: 'SV100',
      email: 'sv100@test.edu',
      ho_ten: 'Le Thi B',
      password: 'Abc@1234',
      lop_id: 'lop-1',
    });

    await useCase.execute(dto);

    expect(mockRepo.createStudent).toHaveBeenCalledWith(
      expect.objectContaining({ nguoi_dung_id: createdUser.id }),
    );
  });

  it('should skip student creation when lop_id is missing', async () => {
    const dto = RegisterDto.fromRequest({
      maso: 'SV100',
      email: 'sv100@test.edu',
      ho_ten: 'Le Thi B',
      password: 'Abc@1234',
    });

    const result = await useCase.execute(dto);

    expect(result).toHaveProperty('token');
    expect(mockRepo.createStudent).not.toHaveBeenCalled();
  });

  it('should throw ConflictError when maso already exists (nguoiDung)', async () => {
    mockRepo.findUserByMaso.mockResolvedValue(createdUser);
    const dto = RegisterDto.fromRequest({
      maso: 'SV100',
      email: 'sv100@test.edu',
      ho_ten: 'Le Thi B',
      password: 'Abc@1234',
    });

    await expect(useCase.execute(dto)).rejects.toThrow();
  });

  it('should throw ConflictError when maso already exists (sinhVien)', async () => {
    mockRepo.findStudentByMssv.mockResolvedValue({ id: 'sv-1', nguoi_dung_id: 'u-1' });
    const dto = RegisterDto.fromRequest({
      maso: 'SV100',
      email: 'sv100@test.edu',
      ho_ten: 'Le Thi B',
      password: 'Abc@1234',
    });

    await expect(useCase.execute(dto)).rejects.toThrow();
  });

  it('should throw ConflictError when email already exists', async () => {
    mockRepo.findUserByEmail.mockResolvedValue(createdUser);
    const dto = RegisterDto.fromRequest({
      maso: 'SV101',
      email: 'sv100@test.edu',
      ho_ten: 'Le Thi B',
      password: 'Abc@1234',
    });

    await expect(useCase.execute(dto)).rejects.toThrow();
  });

  it('should create/find SINH_VIEN role', async () => {
    const dto = RegisterDto.fromRequest({
      maso: 'SV100',
      email: 'sv100@test.edu',
      ho_ten: 'Le Thi B',
      password: 'Abc@1234',
    });

    await useCase.execute(dto);

    expect(mockRepo.findRoleByName).toHaveBeenCalledWith('SINH_VIEN');
  });

  it('should not fail the whole registration if student creation fails', async () => {
    mockRepo.createStudent.mockRejectedValue(new Error('DB constraint'));
    const dto = RegisterDto.fromRequest({
      maso: 'SV100',
      email: 'sv100@test.edu',
      ho_ten: 'Le Thi B',
      password: 'Abc@1234',
      lop_id: 'lop-1',
    });

    // Should still succeed — student creation failure is caught
    const result = await useCase.execute(dto);
    expect(result).toHaveProperty('token');
  });
});
