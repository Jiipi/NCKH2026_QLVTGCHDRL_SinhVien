const { ForbiddenError } = require('../../../../core/errors/AppError');

/**
 * GetUserStatsUseCase
 * Use case for getting user statistics
 * Follows Single Responsibility Principle (SRP)
 */
class GetUserStatsUseCase {
  constructor(userRepository) {
    this.userRepository = userRepository;
  }

  async execute(user) {
    if (user.role !== 'ADMIN') {
      throw new ForbiddenError('Chỉ ADMIN mới được xem stats');
    }

    return await this.userRepository.getStats();
  }
}

module.exports = GetUserStatsUseCase;

