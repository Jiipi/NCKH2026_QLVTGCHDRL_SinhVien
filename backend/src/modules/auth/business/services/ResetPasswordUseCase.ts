/**
 * ResetPasswordUseCase
 * Use case for resetting password with OTP
 * Follows Single Responsibility Principle (SRP)
 */

import { BadRequestError, NotFoundError } from '../../../../core/errors/AppError';
import { logInfo } from '../../../../core/logger';
import { IAuthRepository } from '../interfaces/IAuthRepository';
import { IOtpService } from '../interfaces/IOtpService';
import { IHashService } from './LoginUseCase';

// Extended OTP service interface with markAsUsed support
interface IOtpServiceExtended extends IOtpService {
  verifyOtp(email: string, otp: string, markAsUsed?: boolean): boolean | Promise<boolean>;
}

interface ResetPasswordResult {
  success: boolean;
}

class ResetPasswordUseCase {
  private authRepository: IAuthRepository;
  private hashService: IHashService;
  private otpService: IOtpServiceExtended;

  constructor(
    authRepository: IAuthRepository,
    hashService: IHashService,
    otpService: IOtpServiceExtended
  ) {
    this.authRepository = authRepository;
    this.hashService = hashService;
    this.otpService = otpService;
  }

  async execute(email: string, otp: string, newPassword: string): Promise<ResetPasswordResult> {
    logInfo('Password reset flow started', { email });
    
    // Verify OTP first (markAsUsed = false to allow reuse after verify step)
    const isValid = await this.otpService.verifyOtp(email, otp, false);
    
    if (!isValid) {
      throw new BadRequestError('Mã OTP không hợp lệ hoặc đã hết hạn');
    }

    // Find user and update password
    const user = await this.authRepository.findUserByEmail(email);
    if (!user) {
      throw new NotFoundError('Người dùng không tồn tại');
    }

    // Hash new password
    const hashedPassword = await this.hashService.hash(newPassword);

    await this.authRepository.updateUser(user.id, {
      mat_khau: hashedPassword
    });

    // Mark OTP as used after successful password reset
    await this.otpService.verifyOtp(email, otp, true);

    logInfo('Password reset successfully', { userId: user.id, email });

    return { success: true };
  }
}

export default ResetPasswordUseCase;
