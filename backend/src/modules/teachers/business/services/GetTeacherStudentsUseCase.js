const { ForbiddenError } = require('../../../../core/errors/AppError');

/**
 * GetTeacherStudentsUseCase
 * Use case for getting students in teacher's classes
 * Follows Single Responsibility Principle (SRP)
 */
class GetTeacherStudentsUseCase {
  constructor(teacherRepository) {
    this.teacherRepository = teacherRepository;
  }

  async execute(user, filters = {}) {
    if (user.role !== 'GIANG_VIEN') {
      throw new ForbiddenError('Chỉ giảng viên mới được truy cập');
    }

    const userId = user.sub || user.id;
    const students = await this.teacherRepository.getTeacherStudents(userId, filters);

    // Remove sensitive data
    students.forEach(s => delete s.password);

    return students;
  }
}

module.exports = GetTeacherStudentsUseCase;

