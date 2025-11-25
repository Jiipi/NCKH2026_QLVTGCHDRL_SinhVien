const { NotFoundError, ForbiddenError } = require('../../../../core/errors/AppError');
const usersRepo = require('../../data/repositories/users.repository');

/**
 * DeleteUserUseCase
 * Use case for deleting a user
 * Follows Single Responsibility Principle (SRP)
 */
class DeleteUserUseCase {
  constructor(userRepository) {
    this.userRepository = userRepository;
  }

  async execute(id, user) {
    if (user.role !== 'ADMIN') {
      throw new ForbiddenError('Chỉ ADMIN mới được xóa user');
    }

    const targetUser = await usersRepo.findById(id);
    if (!targetUser) {
      throw new NotFoundError('User không tồn tại');
    }

    // Soft delete
    await this.userRepository.softDelete(id);

    return { message: 'Đã xóa user thành công' };
  }
}

module.exports = DeleteUserUseCase;

