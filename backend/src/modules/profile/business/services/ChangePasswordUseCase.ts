import bcrypt from 'bcryptjs';
import { NotFoundError, ValidationError } from '../../../../core/errors/AppError';
import ChangePasswordDto from '../dto/ChangePasswordDto';
import type IProfileRepository from '../interfaces/IProfileRepository';

/**
 * ChangePasswordUseCase
 * Use case for changing user password
 * Follows Single Responsibility Principle (SRP)
 */
class ChangePasswordUseCase {
  private profileRepository: IProfileRepository;

  constructor(profileRepository: IProfileRepository) {
    this.profileRepository = profileRepository;
  }

  async execute(userId: string, data: unknown): Promise<boolean> {
    const validatedData = ChangePasswordDto.fromRequest(data);

    const user = await this.profileRepository.findUserById(userId);

    if (!user) {
      throw new NotFoundError('Không tìm thấy người dùng');
    }

    // Verify old password
    const isValidPassword = await bcrypt.compare(validatedData.old_password, user.mat_khau);
    if (!isValidPassword) {
      throw new ValidationError('Mật khẩu cũ không đúng');
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(validatedData.new_password, 10);

    // Update password
    await this.profileRepository.updatePassword(userId, hashedPassword);

    return true;
  }
}

export default ChangePasswordUseCase;
module.exports = ChangePasswordUseCase;
