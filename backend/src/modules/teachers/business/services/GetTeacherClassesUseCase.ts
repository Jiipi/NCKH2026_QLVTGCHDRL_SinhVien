/**
 * GetTeacherClassesUseCase
 * Use case for getting teacher's classes
 * Follows Single Responsibility Principle (SRP)
 */

import { ForbiddenError } from '../../../../core/errors/AppError';
import type { ITeacherRepository } from '../interfaces/ITeacherRepository';
import type { TeacherClass } from '../../teachers.types';

/**
 * User object from JWT token
 */
interface AuthUser {
  sub?: string;
  id?: string;
  role: string;
}

/**
 * GetTeacherClassesUseCase
 * Use case for getting teacher's classes
 */
class GetTeacherClassesUseCase {
  private teacherRepository: ITeacherRepository;

  constructor(teacherRepository: ITeacherRepository) {
    this.teacherRepository = teacherRepository;
  }

  async execute(user: AuthUser): Promise<TeacherClass[]> {
    if (user.role !== 'GIANG_VIEN') {
      throw new ForbiddenError('Chỉ giảng viên mới được truy cập');
    }

    const userId = user.sub || user.id;
    if (!userId) {
      throw new ForbiddenError('Không xác định được người dùng');
    }

    return await this.teacherRepository.getTeacherClasses(userId);
  }
}

export default GetTeacherClassesUseCase;
module.exports = GetTeacherClassesUseCase;
