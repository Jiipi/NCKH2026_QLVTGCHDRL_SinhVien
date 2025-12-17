import { NotFoundError } from '../../../../core/errors/AppError';
import type IClassRepository from '../interfaces/IClassRepository';
import type { StudentWithUser } from '../interfaces/IClassRepository';

/**
 * User interface for authorization
 */
export interface AuthUser {
  id: number | string;
  role: string;
  class?: string;
}

/**
 * GetClassStudentsUseCase
 * Use case for getting students in a class
 * Follows Single Responsibility Principle (SRP)
 */
class GetClassStudentsUseCase {
  private classRepository: IClassRepository;

  constructor(classRepository: IClassRepository) {
    this.classRepository = classRepository;
  }

  async execute(classId: string | number, _user: AuthUser): Promise<StudentWithUser[]> {
    const classData = await this.classRepository.findById(classId);
    if (!classData) {
      throw new NotFoundError('Class không tồn tại');
    }

    const students = await this.classRepository.getStudents(classId);
    return students;
  }
}

export default GetClassStudentsUseCase;
module.exports = GetClassStudentsUseCase;
