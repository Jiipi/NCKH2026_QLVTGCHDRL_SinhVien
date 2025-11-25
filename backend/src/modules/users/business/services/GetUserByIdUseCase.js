const { NotFoundError, ForbiddenError } = require('../../../../core/errors/AppError');
const usersRepo = require('../../data/repositories/users.repository');

/**
 * GetUserByIdUseCase
 * Use case for getting a user by ID
 * Follows Single Responsibility Principle (SRP)
 */
class GetUserByIdUseCase {
  constructor(userRepository) {
    this.userRepository = userRepository;
  }

  async execute(id, user) {
    const targetUser = await usersRepo.findById(id, {
      id: true,
      mssv: true,
      fullName: true,
      email: true,
      role: true,
      class: true,
      major: true,
      faculty: true,
      phone: true,
      address: true,
      isActive: true,
      createdAt: true
    });

    if (!targetUser) {
      throw new NotFoundError('User không tồn tại');
    }

    // Check authorization
    await this.checkAccess(targetUser, user);

    return targetUser;
  }

  async checkAccess(targetUser, user) {
    if (user.role === 'ADMIN') return true;
    if (targetUser.id === user.id) return true;
    if (user.role === 'LOP_TRUONG' && targetUser.class === user.class) return true;
    if (user.role === 'GIANG_VIEN') return true;
    throw new ForbiddenError('Bạn không có quyền xem user này');
  }
}

module.exports = GetUserByIdUseCase;

