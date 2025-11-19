const { BadRequestError, NotFoundError } = require('../../../../core/errors/AppError');
const { logInfo } = require('../../../../core/logger');

/**
 * ResetPasswordUseCase
 * Use case for resetting password with OTP
 * Follows Single Responsibility Principle (SRP)
 */
class ResetPasswordUseCase {
  constructor(authRepository, hashService, otpService) {
    this.authRepository = authRepository;
    this.hashService = hashService;
    this.otpService = otpService;
  }

  async execute(email, otp, newPassword) {
    // Verify OTP first
    const isValid = this.otpService.verifyOtp(email, otp);
    if (!isValid) {
      throw new BadRequestError('Mã OTP không hợp lệ hoặc đã hết hạn');
    }

    // Find user and update password
    const user = await this.authRepository.findUserByEmail(email);
    if (!user) {
      throw new NotFoundError('Người dùng không tồn tại');
    }

    // Hash new password
    const config = require('../../../../core/config');
    const hashedPassword = await this.hashService.hash(newPassword);

    await this.authRepository.updateUser(user.id, {
      mat_khau: hashedPassword
    });

    logInfo('Password reset successfully', { userId: user.id, email });

    return { success: true };
  }
}

module.exports = ResetPasswordUseCase;

