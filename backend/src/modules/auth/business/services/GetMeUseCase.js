const { NotFoundError } = require('../../../../core/errors/AppError');

/**
 * GetMeUseCase
 * Use case for getting current user info
 * Follows Single Responsibility Principle (SRP)
 */
class GetMeUseCase {
  constructor(authRepository) {
    this.authRepository = authRepository;
  }

  async execute(userId) {
    // userId is the UUID from JWT token's sub claim
    const user = await this.authRepository.findUserById(userId);
    
    if (!user) {
      throw new NotFoundError('Người dùng không tồn tại');
    }

    return this.toUserDTO(user);
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

module.exports = GetMeUseCase;

