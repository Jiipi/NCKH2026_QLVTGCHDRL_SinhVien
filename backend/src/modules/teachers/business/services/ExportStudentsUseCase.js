const { ForbiddenError } = require('../../../../core/errors/AppError');

/**
 * ExportStudentsUseCase
 * Use case for exporting students list
 * Follows Single Responsibility Principle (SRP)
 */
class ExportStudentsUseCase {
  constructor(teacherRepository) {
    this.teacherRepository = teacherRepository;
  }

  async execute(user) {
    if (user.role !== 'GIANG_VIEN') {
      throw new ForbiddenError('Chỉ giảng viên mới được export');
    }

    const userId = user.sub || user.id;
    return await this.teacherRepository.exportStudents(userId);
  }
}

module.exports = ExportStudentsUseCase;

