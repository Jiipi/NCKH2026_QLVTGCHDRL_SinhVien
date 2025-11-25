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
    console.log('[ResetPasswordUseCase] Starting password reset:', { email, hasOtp: !!otp });
    
    // Verify OTP first (markAsUsed = false to allow reuse after verify step)
    const isValid = this.otpService.verifyOtp(email, otp, false);
    console.log('[ResetPasswordUseCase] OTP verification result:', isValid);
    
    if (!isValid) {
      console.log('[ResetPasswordUseCase] OTP invalid or expired');
      throw new BadRequestError('Mã OTP không hợp lệ hoặc đã hết hạn');
    }

    // Find user and update password
    const user = await this.authRepository.findUserByEmail(email);
    if (!user) {
      console.log('[ResetPasswordUseCase] User not found:', email);
      throw new NotFoundError('Người dùng không tồn tại');
    }

    // Hash new password
    const config = require('../../../../core/config');
    const hashedPassword = await this.hashService.hash(newPassword);

    await this.authRepository.updateUser(user.id, {
      mat_khau: hashedPassword
    });

    // Mark OTP as used after successful password reset (verify again with markAsUsed = true)
    // This will mark it as used without checking validity again (since we already verified)
    this.otpService.verifyOtp(email, otp, true);

    logInfo('Password reset successfully', { userId: user.id, email });
    console.log('[ResetPasswordUseCase] Password reset completed successfully');

    return { success: true };
  }
}

module.exports = ResetPasswordUseCase;

