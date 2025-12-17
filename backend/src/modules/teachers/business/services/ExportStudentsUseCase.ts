/**
 * ExportStudentsUseCase
 * Use case for exporting students list
 * Follows Single Responsibility Principle (SRP)
 */

import { ForbiddenError } from '../../../../core/errors/AppError';
import type { ITeacherRepository } from '../interfaces/ITeacherRepository';
import type { TeacherStudent } from '../../teachers.types';

/**
 * User object from JWT token
 */
interface AuthUser {
  sub?: string;
  id?: string;
  role: string;
}

/**
 * ExportStudentsUseCase
 * Use case for exporting students list
 */
class ExportStudentsUseCase {
  private teacherRepository: ITeacherRepository;

  constructor(teacherRepository: ITeacherRepository) {
    this.teacherRepository = teacherRepository;
  }

  async execute(user: AuthUser): Promise<TeacherStudent[]> {
    if (user.role !== 'GIANG_VIEN') {
      throw new ForbiddenError('Chỉ giảng viên mới được export');
    }

    const userId = user.sub || user.id;
    if (!userId) {
      throw new ForbiddenError('Không xác định được người dùng');
    }

    return await this.teacherRepository.exportStudents(userId);
  }
}

export default ExportStudentsUseCase;
module.exports = ExportStudentsUseCase;
