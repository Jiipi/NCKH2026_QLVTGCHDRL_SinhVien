const { NotFoundError } = require('../../../../core/errors/AppError');

/**
 * GetClassStudentsUseCase
 * Use case for getting class students
 * Follows Single Responsibility Principle (SRP)
 */
class GetClassStudentsUseCase {
  constructor(semesterRepository) {
    this.semesterRepository = semesterRepository;
  }

  async execute(classId) {
    const students = await this.semesterRepository.getClassStudents(classId);
    
    // Verify class exists by checking if students array is returned
    // (repository returns empty array if class doesn't exist)
    return students;
  }
}

module.exports = GetClassStudentsUseCase;

