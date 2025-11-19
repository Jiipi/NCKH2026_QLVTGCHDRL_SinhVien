const { NotFoundError, ForbiddenError, ValidationError } = require('../../../../core/errors/AppError');

/**
 * DeleteClassUseCase
 * Use case for deleting a class
 * Follows Single Responsibility Principle (SRP)
 */
class DeleteClassUseCase {
  constructor(classRepository) {
    this.classRepository = classRepository;
  }

  async execute(id, user) {
    if (user.role !== 'ADMIN') {
      throw new ForbiddenError('Chỉ ADMIN mới được xóa class');
    }

    const classData = await this.classRepository.findById(id);
    if (!classData) {
      throw new NotFoundError('Class không tồn tại');
    }

    // Check if class has students
    const stats = await this.classRepository.getStats(id);
    if (stats && stats.totalStudents > 0) {
      throw new ValidationError('Không thể xóa class đang có sinh viên');
    }

    // Delete
    await this.classRepository.delete(id);

    return { message: 'Đã xóa class thành công' };
  }
}

module.exports = DeleteClassUseCase;

