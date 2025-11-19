const { NotFoundError, ForbiddenError } = require('../../../../core/errors/AppError');

/**
 * AssignTeacherUseCase
 * Use case for assigning a teacher to a class
 * Follows Single Responsibility Principle (SRP)
 */
class AssignTeacherUseCase {
  constructor(classRepository) {
    this.classRepository = classRepository;
  }

  async execute(classId, teacherId, user) {
    if (user.role !== 'ADMIN') {
      throw new ForbiddenError('Chỉ ADMIN mới được gán giảng viên');
    }

    const classData = await this.classRepository.findById(classId);
    if (!classData) {
      throw new NotFoundError('Class không tồn tại');
    }

    // Assign
    await this.classRepository.assignTeacher(classId, teacherId);

    return { message: 'Đã gán giảng viên thành công' };
  }
}

module.exports = AssignTeacherUseCase;

