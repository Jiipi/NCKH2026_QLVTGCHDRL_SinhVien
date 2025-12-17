/**
 * AssignClassMonitorUseCase
 * Use case for assigning class monitor
 * Follows Single Responsibility Principle (SRP)
 */

import { ForbiddenError, ValidationError } from '../../../../core/errors/AppError';
import type { ITeacherRepository } from '../interfaces/ITeacherRepository';

/**
 * User object from JWT token
 */
interface AuthUser {
  sub?: string;
  id?: string;
  role: string;
}

/**
 * Result of assigning class monitor
 */
interface AssignMonitorResult {
  classId: string;
  monitorStudentId: string;
}

/**
 * AssignClassMonitorUseCase
 * Use case for assigning class monitor
 */
class AssignClassMonitorUseCase {
  private teacherRepository: ITeacherRepository;

  constructor(teacherRepository: ITeacherRepository) {
    this.teacherRepository = teacherRepository;
  }

  async execute(classId: string, studentId: string, user: AuthUser): Promise<AssignMonitorResult> {
    if (user.role !== 'GIANG_VIÊN' && user.role !== 'GIANG_VIEN') {
      throw new ForbiddenError('Chỉ giảng viên mới được gán lớp trưởng');
    }

    const teacherId = user.sub || user.id;
    if (!teacherId) {
      throw new ForbiddenError('Không xác định được người dùng');
    }

    if (!classId || !studentId) {
      throw new ValidationError('Thiếu classId hoặc sinh_vien_id');
    }

    const result = await this.teacherRepository.assignClassMonitor(String(teacherId), String(classId), String(studentId));
    return result;
  }
}

export default AssignClassMonitorUseCase;
module.exports = AssignClassMonitorUseCase;
