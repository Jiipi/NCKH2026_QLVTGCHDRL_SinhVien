/**
 * GetClassStudentsUseCase
 * Use case for getting class students
 * Follows Single Responsibility Principle (SRP)
 */

import type { ClassStudent } from '../interfaces/ISemesterRepository';
import type ISemesterRepository from '../interfaces/ISemesterRepository';

class GetClassStudentsUseCase {
  private semesterRepository: ISemesterRepository;

  constructor(semesterRepository: ISemesterRepository) {
    this.semesterRepository = semesterRepository;
  }

  async execute(classId: string): Promise<ClassStudent[]> {
    const students = await this.semesterRepository.getClassStudents(classId);
    
    // Verify class exists by checking if students array is returned
    // (repository returns empty array if class doesn't exist)
    return students;
  }
}

export default GetClassStudentsUseCase;
module.exports = GetClassStudentsUseCase;
