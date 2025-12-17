/**
 * ChangePasswordUseCase
 * Use case for changing user password
 * Follows Single Responsibility Principle (SRP)
 */

import { NotFoundError, BadRequestError } from '../../../../core/errors/AppError';
import { logInfo } from '../../../../core/logger';
import { IAuthRepository } from '../interfaces/IAuthRepository';
import { IHashService } from './LoginUseCase';

class ChangePasswordUseCase {
  private authRepository: IAuthRepository;
  private hashService: IHashService;

  constructor(authRepository: IAuthRepository, hashService: IHashService) {
    this.authRepository = authRepository;
    this.hashService = hashService;
  }

  async execute(userId: string, currentPassword: string, newPassword: string): Promise<void> {
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
    const hashedPassword = await this.hashService.hash(newPassword);

    // Update password
    await this.authRepository.updateUser(userId, {
      mat_khau: hashedPassword
    });

    logInfo('Password changed', { userId });
  }
}

export default ChangePasswordUseCase;
