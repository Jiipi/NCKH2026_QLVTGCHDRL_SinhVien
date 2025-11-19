const { NotFoundError, ForbiddenError } = require('../../../../core/errors/AppError');

/**
 * UpdateClassUseCase
 * Use case for updating a class
 * Follows Single Responsibility Principle (SRP)
 */
class UpdateClassUseCase {
  constructor(classRepository) {
    this.classRepository = classRepository;
  }

  async execute(id, data, user) {
    if (user.role !== 'ADMIN') {
      throw new ForbiddenError('Chỉ ADMIN mới được cập nhật class');
    }

    const classData = await this.classRepository.findById(id);
    if (!classData) {
      throw new NotFoundError('Class không tồn tại');
    }

    // Update
    const updated = await this.classRepository.update(id, data);

    return updated;
  }
}

module.exports = UpdateClassUseCase;

