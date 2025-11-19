const { ConflictError } = require('../../../../core/errors/AppError');
const { logInfo } = require('../../../../core/logger');

/**
 * RegisterUseCase
 * Use case for user registration
 * Follows Single Responsibility Principle (SRP)
 */
class RegisterUseCase {
  constructor(authRepository, hashService, tokenService) {
    this.authRepository = authRepository;
    this.hashService = hashService;
    this.tokenService = tokenService;
  }

  async execute(dto) {
    // Check if maso exists
    const existingUser = await this.authRepository.findUserByMaso(dto.maso);
    if (existingUser) {
      throw new ConflictError('Mã số đã được sử dụng', [
        { field: 'maso', message: 'Mã số đã được sử dụng' }
      ]);
    }

    // Check if email exists
    const existingEmail = await this.authRepository.findUserByEmail(dto.email);
    if (existingEmail) {
      throw new ConflictError('Email đã được sử dụng', [
        { field: 'email', message: 'Email đã được sử dụng' }
      ]);
    }

    // Get or create student role
    let studentRole = await this.authRepository.findRoleByName('SINH_VIEN');
    if (!studentRole) {
      studentRole = await this.authRepository.createRole({
        ten_vt: 'SINH_VIEN',
        mo_ta: 'Sinh viên'
      });
    }

    // Hash password
    const config = require('../../../../core/config');
    const hashedPassword = await this.hashService.hash(dto.password);

    // Create user
    const newUser = await this.authRepository.createUser({
      ten_dn: dto.maso,
      email: dto.email,
      ho_ten: dto.ho_ten,
      mat_khau: hashedPassword,
      vai_tro_id: studentRole.id,
      trang_thai: 'hoat_dong'
    });

    // Create student record if lop_id provided
    if (dto.lop_id) {
      await this.authRepository.createStudent({
        nguoi_dung_id: newUser.id,
        lop_id: dto.lop_id,
        khoa: dto.khoa || 'Chưa xác định',
        mssv: dto.maso
      });
    }

    // Generate token
    const token = this.tokenService.generateToken(newUser);

    logInfo('User registered successfully', {
      userId: newUser.id,
      maso: newUser.ten_dn,
      email: newUser.email
    });

    return {
      token,
      user: this.toUserDTO(newUser)
    };
  }

  toUserDTO(user) {
    const role = user.vai_tro;
    return {
      id: user.id,
      maso: user.ten_dn,
      email: user.email,
      ho_ten: user.ho_ten,
      roleCode: role?.ten_vt || 'STUDENT',
      roleName: role?.mo_ta || 'Sinh viên',
      avatar: user.anh_dai_dien,
      status: user.trang_thai
    };
  }
}

module.exports = RegisterUseCase;

