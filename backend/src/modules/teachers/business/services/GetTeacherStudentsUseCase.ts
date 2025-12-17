/**
 * GetTeacherStudentsUseCase
 * Use case for getting students in teacher's classes
 * Follows Single Responsibility Principle (SRP)
 */

import { ForbiddenError } from '../../../../core/errors/AppError';
import type { ITeacherRepository } from '../interfaces/ITeacherRepository';
import type { TeacherStudent, TeacherStudentFilters } from '../../teachers.types';

/**
 * User object from JWT token
 */
interface AuthUser {
  sub?: string;
  id?: string;
  role: string;
}

/**
 * Student data with optional password field to be removed
 */
interface StudentWithPassword extends TeacherStudent {
  password?: string;
}

/**
 * GetTeacherStudentsUseCase
 * Use case for getting students in teacher's classes
 */
class GetTeacherStudentsUseCase {
  private teacherRepository: ITeacherRepository;

  constructor(teacherRepository: ITeacherRepository) {
    this.teacherRepository = teacherRepository;
  }

  async execute(user: AuthUser, filters: TeacherStudentFilters = {}): Promise<TeacherStudent[]> {
    if (user.role !== 'GIANG_VIEN') {
      throw new ForbiddenError('Chỉ giảng viên mới được truy cập');
    }

    const userId = user.sub || user.id;
    if (!userId) {
      throw new ForbiddenError('Không xác định được người dùng');
    }

    const students = await this.teacherRepository.getTeacherStudents(userId, filters) as StudentWithPassword[];

    // Remove sensitive data
    students.forEach(s => delete s.password);

    return students;
  }
}

export default GetTeacherStudentsUseCase;
module.exports = GetTeacherStudentsUseCase;
