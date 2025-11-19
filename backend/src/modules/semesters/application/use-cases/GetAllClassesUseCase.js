/**
 * GetAllClassesUseCase
 * Use case for getting all classes
 * Follows Single Responsibility Principle (SRP)
 */
class GetAllClassesUseCase {
  constructor(semesterRepository) {
    this.semesterRepository = semesterRepository;
  }

  async execute() {
    return this.semesterRepository.getAllClasses();
  }
}

module.exports = GetAllClassesUseCase;

