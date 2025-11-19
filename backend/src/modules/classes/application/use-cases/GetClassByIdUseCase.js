const { NotFoundError, ForbiddenError } = require('../../../../core/errors/AppError');

/**
 * GetClassByIdUseCase
 * Use case for getting a class by ID
 * Follows Single Responsibility Principle (SRP)
 */
class GetClassByIdUseCase {
  constructor(classRepository) {
    this.classRepository = classRepository;
  }

  async execute(id, user, includeStudents = false) {
    const classData = await this.classRepository.findById(id, {
      students: includeStudents,
      teachers: true
    });

    if (!classData) {
      throw new NotFoundError('Class không tồn tại');
    }

    // Check authorization
    await this.checkAccess(classData, user);

    return classData;
  }

  async checkAccess(classData, user) {
    if (user.role === 'ADMIN') return true;
    if (user.role === 'GIANG_VIEN') return true;
    if (classData.name === user.class) return true;
    throw new ForbiddenError('Bạn không có quyền xem class này');
  }
}

module.exports = GetClassByIdUseCase;

