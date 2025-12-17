/**
 * GetAllClassesUseCase
 * Use case for getting all classes
 * Follows Single Responsibility Principle (SRP)
 */

import type ISemesterRepository from '../interfaces/ISemesterRepository';
import type { ClassDetail } from '../interfaces/ISemesterRepository';

class GetAllClassesUseCase {
  private semesterRepository: ISemesterRepository;

  constructor(semesterRepository: ISemesterRepository) {
    this.semesterRepository = semesterRepository;
  }

  async execute(): Promise<ClassDetail[]> {
    return this.semesterRepository.getAllClasses();
  }
}

export default GetAllClassesUseCase;
module.exports = GetAllClassesUseCase;
