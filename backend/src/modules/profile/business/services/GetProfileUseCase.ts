import { NotFoundError } from '../../../../core/errors/AppError';
import type IProfileRepository from '../interfaces/IProfileRepository';
import type { UserWithRelations } from '../interfaces/IProfileRepository';

/**
 * GetProfileUseCase
 * Use case for getting user profile
 * Follows Single Responsibility Principle (SRP)
 */

export type UserWithoutPassword = Omit<UserWithRelations, 'mat_khau'>;

class GetProfileUseCase {
  private profileRepository: IProfileRepository;

  constructor(profileRepository: IProfileRepository) {
    this.profileRepository = profileRepository;
  }

  async execute(userId: string): Promise<UserWithoutPassword> {
    const user = await this.profileRepository.findUserById(userId);

    if (!user) {
      throw new NotFoundError('Không tìm thấy người dùng');
    }

    // Remove sensitive data
    const { mat_khau, ...userWithoutPassword } = user;

    return userWithoutPassword;
  }
}

export default GetProfileUseCase;
module.exports = GetProfileUseCase;
