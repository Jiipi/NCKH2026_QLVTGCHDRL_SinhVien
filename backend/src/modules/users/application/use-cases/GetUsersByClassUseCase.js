const { ForbiddenError } = require('../../../../core/errors/AppError');
const usersRepo = require('../../users.repo');

/**
 * GetUsersByClassUseCase
 * Use case for getting users by class
 * Follows Single Responsibility Principle (SRP)
 */
class GetUsersByClassUseCase {
  constructor(userRepository) {
    this.userRepository = userRepository;
  }

  async execute(className, user) {
    // Authorization
    if (user.role === 'SINH_VIEN') {
      throw new ForbiddenError('Bạn không có quyền xem danh sách lớp');
    }

    if (user.role === 'LOP_TRUONG' && user.class !== className) {
      throw new ForbiddenError('Bạn chỉ được xem lớp của mình');
    }

    const users = await this.userRepository.findByClass(className);

    // Remove passwords
    users.forEach(u => delete u.password);

    return users;
  }
}

module.exports = GetUsersByClassUseCase;

