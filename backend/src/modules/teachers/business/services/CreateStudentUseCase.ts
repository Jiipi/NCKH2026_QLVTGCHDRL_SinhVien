/**
 * CreateStudentUseCase
 * Use case for creating a single student in teacher's class
 * Follows Single Responsibility Principle (SRP)
 */

import { ForbiddenError } from '../../../../core/errors/AppError';
import type { ITeacherRepository, CreateStudentPayload, CreateStudentResult } from '../interfaces/ITeacherRepository';

/**
 * User object from JWT token
 */
interface AuthUser {
  sub?: string;
  id?: string;
  role: string;
}

/**
 * CreateStudentUseCase
 * Use case for creating a single student in teacher's class
 */
class CreateStudentUseCase {
  private teacherRepository: ITeacherRepository;

  constructor(teacherRepository: ITeacherRepository) {
    this.teacherRepository = teacherRepository;
  }

  async execute(user: AuthUser, payload: CreateStudentPayload): Promise<CreateStudentResult> {
    if (user.role !== 'GIANG_VIEN' && user.role !== 'GIANG_VIÊN') {
      throw new ForbiddenError('Chỉ giảng viên mới được tạo sinh viên');
    }

    const userId = user.sub || user.id;
    if (!userId) {
      throw new ForbiddenError('Không xác định được người dùng');
    }

    return await this.teacherRepository.createStudent(userId, payload);
  }
}

export default CreateStudentUseCase;
module.exports = CreateStudentUseCase;
