import type IUserRepository from '../interfaces/IUserRepository';
const { NotFoundError, ForbiddenError } = require('../../../../core/errors/AppError');
const usersRepo = require('../../data/repositories/users.repository');

interface AuthUser {
  id: string | number;
  role: string;
}

interface DeleteResult {
  message: string;
}

/**
 * DeleteUserUseCase
 * Use case for deleting a user
 * Follows Single Responsibility Principle (SRP)
 */
class DeleteUserUseCase {
  private userRepository: IUserRepository;

  constructor(userRepository: IUserRepository) {
    this.userRepository = userRepository;
  }

  async execute(id: string, user: AuthUser): Promise<DeleteResult> {
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

export default DeleteUserUseCase;
module.exports = DeleteUserUseCase;
