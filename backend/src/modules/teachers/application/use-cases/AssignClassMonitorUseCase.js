const { ForbiddenError, ValidationError } = require('../../../../core/errors/AppError');

/**
 * AssignClassMonitorUseCase
 * Use case for assigning class monitor
 * Follows Single Responsibility Principle (SRP)
 */
class AssignClassMonitorUseCase {
  constructor(teacherRepository) {
    this.teacherRepository = teacherRepository;
  }

  async execute(classId, studentId, user) {
    if (user.role !== 'GIANG_VIÊN' && user.role !== 'GIANG_VIEN') {
      throw new ForbiddenError('Chỉ giảng viên mới được gán lớp trưởng');
    }

    const teacherId = user.sub || user.id;
    if (!classId || !studentId) {
      throw new ValidationError('Thiếu classId hoặc sinh_vien_id');
    }

    const result = await this.teacherRepository.assignClassMonitor(String(teacherId), String(classId), String(studentId));
    return result;
  }
}

module.exports = AssignClassMonitorUseCase;

