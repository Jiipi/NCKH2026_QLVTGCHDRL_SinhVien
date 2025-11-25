const { NotFoundError } = require('../../../../core/errors/AppError');

/**
 * GetClassStudentsUseCase
 * Use case for getting students in a class
 * Follows Single Responsibility Principle (SRP)
 */
class GetClassStudentsUseCase {
  constructor(classRepository) {
    this.classRepository = classRepository;
  }

  async execute(classId, user) {
    const classData = await this.classRepository.findById(classId);
    if (!classData) {
      throw new NotFoundError('Class không tồn tại');
    }

    const students = await this.classRepository.getStudents(classId);
    return students;
  }
}

module.exports = GetClassStudentsUseCase;

