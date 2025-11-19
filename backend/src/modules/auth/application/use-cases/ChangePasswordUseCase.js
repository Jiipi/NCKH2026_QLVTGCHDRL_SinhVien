const { NotFoundError, BadRequestError } = require('../../../../core/errors/AppError');
const { logInfo } = require('../../../../core/logger');

/**
 * ChangePasswordUseCase
 * Use case for changing user password
 * Follows Single Responsibility Principle (SRP)
 */
class ChangePasswordUseCase {
  constructor(authRepository, hashService) {
    this.authRepository = authRepository;
    this.hashService = hashService;
  }

  async execute(userId, currentPassword, newPassword) {
    const user = await this.authRepository.findUserById(userId);

    if (!user) {
      throw new NotFoundError('Người dùng không tồn tại');
    }

    // Verify current password
    const isValid = await this.hashService.compare(currentPassword, user.mat_khau);
    if (!isValid) {
      throw new BadRequestError('Mật khẩu hiện tại không đúng');
    }

    // Hash new password
    const config = require('../../../../core/config');
    const hashedPassword = await this.hashService.hash(newPassword);

    // Update password
    await this.authRepository.updateUser(userId, {
      mat_khau: hashedPassword
    });

    logInfo('Password changed', { userId });
  }
}

module.exports = ChangePasswordUseCase;

