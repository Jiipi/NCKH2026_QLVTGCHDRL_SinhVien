import { NotFoundError, ForbiddenError } from '../../../../core/errors/AppError';
import type IClassRepository from '../interfaces/IClassRepository';

/**
 * User interface for authorization
 */
export interface AuthUser {
  id: number | string;
  role: string;
  class?: string;
}

/**
 * AssignTeacherUseCase
 * Use case for assigning a teacher to a class
 * Follows Single Responsibility Principle (SRP)
 */
class AssignTeacherUseCase {
  private classRepository: IClassRepository;

  constructor(classRepository: IClassRepository) {
    this.classRepository = classRepository;
  }

  async execute(classId: string | number, teacherId: string | number, user: AuthUser): Promise<{ message: string }> {
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

export default AssignTeacherUseCase;
module.exports = AssignTeacherUseCase;
