import type IUserRepository from '../interfaces/IUserRepository';
import type { UserStats } from '../interfaces/IUserRepository';
import { ForbiddenError } from '../../../../core/errors/AppError';

interface AuthUser {
  id: string | number;
  role: string;
}

/**
 * GetUserStatsUseCase
 * Use case for getting user statistics
 * Follows Single Responsibility Principle (SRP)
 */
class GetUserStatsUseCase {
  private userRepository: IUserRepository;

  constructor(userRepository: IUserRepository) {
    this.userRepository = userRepository;
  }

  async execute(user: AuthUser): Promise<UserStats> {
    if (user.role !== 'ADMIN') {
      throw new ForbiddenError('Chỉ ADMIN mới được xem stats');
    }

    return await this.userRepository.getStats();
  }
}

export default GetUserStatsUseCase;
module.exports = GetUserStatsUseCase;
