/**
 * GetClassStatisticsUseCase
 * Use case for getting class statistics
 * Follows Single Responsibility Principle (SRP)
 */

import { ForbiddenError } from '../../../../core/errors/AppError';
import type { ITeacherRepository } from '../interfaces/ITeacherRepository';
import type { ClassStats } from '../../teachers.types';

/**
 * User object from JWT token
 */
interface AuthUser {
  sub?: string;
  id?: string;
  role: string;
}

/**
 * GetClassStatisticsUseCase
 * Use case for getting class statistics
 */
class GetClassStatisticsUseCase {
  private teacherRepository: ITeacherRepository;

  constructor(teacherRepository: ITeacherRepository) {
    this.teacherRepository = teacherRepository;
  }

  async execute(className: string, semesterId: string | null, user: AuthUser): Promise<ClassStats> {
    if (user.role !== 'GIANG_VIEN') {
      throw new ForbiddenError('Chỉ giảng viên mới được xem thống kê');
    }

    const userId = user.sub || user.id;
    if (!userId) {
      throw new ForbiddenError('Không xác định được người dùng');
    }

    const hasAccess = await this.teacherRepository.hasAccessToClass(userId, className);
    if (!hasAccess) {
      throw new ForbiddenError('Bạn không có quyền xem lớp này');
    }

    return await this.teacherRepository.getClassStats(className, semesterId);
  }
}

export default GetClassStatisticsUseCase;
module.exports = GetClassStatisticsUseCase;
