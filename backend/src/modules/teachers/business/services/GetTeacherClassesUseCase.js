const { ForbiddenError } = require('../../../../core/errors/AppError');

/**
 * GetTeacherClassesUseCase
 * Use case for getting teacher's classes
 * Follows Single Responsibility Principle (SRP)
 */
class GetTeacherClassesUseCase {
  constructor(teacherRepository) {
    this.teacherRepository = teacherRepository;
  }

  async execute(user) {
    if (user.role !== 'GIANG_VIEN') {
      throw new ForbiddenError('Chỉ giảng viên mới được truy cập');
    }

    const userId = user.sub || user.id;
    return await this.teacherRepository.getTeacherClasses(userId);
  }
}

module.exports = GetTeacherClassesUseCase;

