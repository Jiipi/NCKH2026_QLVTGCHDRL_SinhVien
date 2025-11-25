const { NotFoundError } = require('../../../../core/errors/AppError');

/**
 * GetProfileUseCase
 * Use case for getting user profile
 * Follows Single Responsibility Principle (SRP)
 */
class GetProfileUseCase {
  constructor(profileRepository) {
    this.profileRepository = profileRepository;
  }

  async execute(userId) {
    const user = await this.profileRepository.findUserById(userId);

    if (!user) {
      throw new NotFoundError('Không tìm thấy người dùng');
    }

    // Remove sensitive data
    const { mat_khau, ...userWithoutPassword } = user;

    return userWithoutPassword;
  }
}

module.exports = GetProfileUseCase;

