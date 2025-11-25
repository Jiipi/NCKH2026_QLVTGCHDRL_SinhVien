const { ForbiddenError } = require('../../../../core/errors/AppError');

/**
 * GetAllRegistrationsUseCase
 * Use case for getting all registrations for teacher's classes
 * Follows Single Responsibility Principle (SRP)
 */
class GetAllRegistrationsUseCase {
  constructor(teacherRepository) {
    this.teacherRepository = teacherRepository;
  }

  async execute(user, filters = {}) {
    if (user.role !== 'GIANG_VIEN') {
      throw new ForbiddenError('Chỉ giảng viên mới được truy cập');
    }

    const { status, semester, classId } = filters;
    const userId = user.sub || user.id;
    
    let classes = await this.teacherRepository.getTeacherClasses(userId);
    
    if (classId) {
      classes = classes.filter(c => String(c.id) === String(classId));
    }
    
    if (!classes || classes.length === 0) {
      return [];
    }
    
    const classIds = classes.map(c => c.id);
    
    const registrations = await this.teacherRepository.getClassRegistrations(classIds, {
      status,
      semester
    });
    
    return registrations;
  }
}

module.exports = GetAllRegistrationsUseCase;

