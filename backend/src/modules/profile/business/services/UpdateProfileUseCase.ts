import { NotFoundError, ValidationError } from '../../../../core/errors/AppError';
import UpdateProfileDto from '../dto/UpdateProfileDto';
import type IProfileRepository from '../interfaces/IProfileRepository';
import type { UserWithRelations } from '../interfaces/IProfileRepository';

/**
 * UpdateProfileUseCase
 * Use case for updating user profile
 * Follows Single Responsibility Principle (SRP)
 */

export type UserWithoutPassword = Omit<UserWithRelations, 'mat_khau'>;

class UpdateProfileUseCase {
  private profileRepository: IProfileRepository;

  constructor(profileRepository: IProfileRepository) {
    this.profileRepository = profileRepository;
  }

  async execute(userId: string, data: unknown): Promise<UserWithoutPassword> {
    const validatedData = UpdateProfileDto.fromRequest(data);

    const existingUser = await this.profileRepository.findUserById(userId);

    if (!existingUser) {
      throw new NotFoundError('Không tìm thấy người dùng');
    }

    // If email is being updated, check if it's already taken
    if (validatedData.email && validatedData.email !== existingUser.email) {
      const emailExists = await this.profileRepository.findByEmail(validatedData.email, userId);

      if (emailExists) {
        throw new ValidationError('Email đã được sử dụng');
      }
    }

    // Update user
    const updatedUser = await this.profileRepository.updateUser(userId, validatedData);

    // Remove sensitive data
    const { mat_khau, ...userWithoutPassword } = updatedUser;

    return userWithoutPassword;
  }
}

export default UpdateProfileUseCase;
module.exports = UpdateProfileUseCase;
