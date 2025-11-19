const { NotFoundError } = require('../../../../core/errors/AppError');
const { mapUserToDetail } = require('../../admin-users.mappers');

/**
 * GetUserByIdUseCase
 * Use case for retrieving a user by ID
 * Follows Single Responsibility Principle (SRP)
 */
class GetUserByIdUseCase {
  constructor(adminUserRepository) {
    this.adminUserRepository = adminUserRepository;
  }

  async execute(userId) {
    const user = await this.adminUserRepository.findUserById(userId);

    if (!user) {
      throw new NotFoundError(`Không tìm thấy người dùng với id ${userId}`);
    }

    return mapUserToDetail(user);
  }
}

module.exports = GetUserByIdUseCase;

