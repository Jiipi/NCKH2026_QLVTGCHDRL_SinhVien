const { ForbiddenError } = require('../../../../core/errors/AppError');

/**
 * CreateStudentUseCase
 * Use case for creating a single student in teacher's class
 * Follows Single Responsibility Principle (SRP)
 */
class CreateStudentUseCase {
  constructor(teacherRepository) {
    this.teacherRepository = teacherRepository;
  }

  async execute(user, payload) {
    if (user.role !== 'GIANG_VIEN' && user.role !== 'GIANG_VIÊN') {
      throw new ForbiddenError('Chỉ giảng viên mới được tạo sinh viên');
    }
    const userId = user.sub || user.id;
    return await this.teacherRepository.createStudent(userId, payload);
  }
}

module.exports = CreateStudentUseCase;

