/**
 * GetAllRegistrationsUseCase
 * Use case for getting all registrations for teacher's classes
 * Follows Single Responsibility Principle (SRP)
 */

import { ForbiddenError } from '../../../../core/errors/AppError';
import type { ITeacherRepository } from '../interfaces/ITeacherRepository';
import type { ClassRegistration, ClassRegistrationFilters } from '../../teachers.types';

/**
 * User object from JWT token
 */
interface AuthUser {
  sub?: string;
  id?: string;
  role: string;
}

/**
 * Filters for getting registrations
 */
interface RegistrationFilters {
  status?: string;
  semester?: string;
  classId?: string;
}

/**
 * Class data with id
 */
interface ClassData {
  id: string;
  ten_lop?: string;
}

/**
 * GetAllRegistrationsUseCase
 * Use case for getting all registrations for teacher's classes
 */
class GetAllRegistrationsUseCase {
  private teacherRepository: ITeacherRepository;

  constructor(teacherRepository: ITeacherRepository) {
    this.teacherRepository = teacherRepository;
  }

  async execute(user: AuthUser, filters: RegistrationFilters = {}): Promise<ClassRegistration[]> {
    if (user.role !== 'GIANG_VIEN') {
      throw new ForbiddenError('Chỉ giảng viên mới được truy cập');
    }

    const { status, semester, classId } = filters;
    const userId = user.sub || user.id;
    if (!userId) {
      throw new ForbiddenError('Không xác định được người dùng');
    }
    
    let classes = await this.teacherRepository.getTeacherClasses(userId) as unknown as ClassData[];
    
    if (classId) {
      classes = classes.filter(c => String(c.id) === String(classId));
    }
    
    if (!classes || classes.length === 0) {
      return [];
    }
    
    const classIds = classes.map(c => c.id);
    
    const registrations = await this.teacherRepository.getClassRegistrations(classIds, {
      status,
      semester
    } as ClassRegistrationFilters);
    
    return registrations;
  }
}

export default GetAllRegistrationsUseCase;
module.exports = GetAllRegistrationsUseCase;
