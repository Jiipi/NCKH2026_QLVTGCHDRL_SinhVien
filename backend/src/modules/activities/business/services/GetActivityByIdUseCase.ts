import type { HoatDong, TrangThaiHoatDong } from '@prisma/client';
import type IActivityRepository from '../interfaces/IActivityRepository';
import { NotFoundError, ForbiddenError } from '../../../../core/errors/AppError';

interface User {
  sub: string;
  role: string;
}

interface Scope {
  isAdmin?: boolean;
  classId?: string;
  teacherOf?: string[];
}

interface ActivityWithStatus extends HoatDong {
  trang_thai: TrangThaiHoatDong;
}

/**
 * GetActivityByIdUseCase
 * Use case for retrieving a single activity by ID
 * Follows Single Responsibility Principle (SRP)
 * 
 * Access rules:
 * - ADMIN: Can view any activity
 * - GIANG_VIEN: Can view activities from classes they teach
 * - LOP_TRUONG: Can view activities from their class or school-wide (lop_id = null)
 * - SINH_VIEN: Can view:
 *   1. Activities from their class
 *   2. School-wide activities (lop_id = null)
 *   3. Activities they have registered for
 */
class GetActivityByIdUseCase {
  private activityRepository: IActivityRepository;

  constructor(activityRepository: IActivityRepository) {
    this.activityRepository = activityRepository;
  }

  async execute(id: string, scope: Scope | null, user: User, semesterInfo?: { hoc_ky: string; nam_hoc: string }): Promise<HoatDong> {
    // First, fetch the activity without scope filter
    // DO NOT filter by semester for GET by ID - students should see activities they registered for
    // regardless of semester. Semester filtering only applies to LIST operations.
    const activity = await this.activityRepository.findById(id, {}, null, undefined);

    if (!activity) {
      throw new NotFoundError('Không tìm thấy hoạt động');
    }

    // Check access based on user role
    const hasAccess = await this.checkAccess(activity as ActivityWithStatus, scope, user);
    
    if (!hasAccess) {
      throw new NotFoundError('Không tìm thấy hoạt động');
    }

    return this.enrichActivity(activity, user);
  }

  /**
   * Check if user has access to view the activity
   */
  private async checkAccess(activity: ActivityWithStatus, scope: Scope | null, user: User): Promise<boolean> {
    // ADMIN has full access
    if (scope?.isAdmin || user?.role === 'ADMIN') {
      return true;
    }

    const userRole = user?.role;
    const classId = scope?.classId;

    // School-wide activities (lop_id = null) are visible to everyone
    if (!activity.lop_id) {
      // But still need to check status for students
      if (userRole === 'SINH_VIEN') {
        return ['da_duyet', 'ket_thuc'].includes(activity.trang_thai);
      }
      return true;
    }

    // GIANG_VIEN: Can view activities from classes they teach
    if (userRole === 'GIANG_VIEN' && scope?.teacherOf?.length && scope.teacherOf.length > 0) {
      if (scope.teacherOf.includes(activity.lop_id)) {
        return true;
      }
    }

    // LOP_TRUONG: Can view activities from their class
    if (userRole === 'LOP_TRUONG' && classId) {
      if (activity.lop_id === classId) {
        return true;
      }
    }

    // SINH_VIEN: Can view activities from their class (with status filter)
    if (userRole === 'SINH_VIEN') {
      // Check if activity belongs to student's class
      if (classId && activity.lop_id === classId) {
        return ['da_duyet', 'ket_thuc'].includes(activity.trang_thai);
      }

      // Check if student has registered for this activity
      const userId = user?.sub;
      if (userId) {
        const sinhVien = await this.activityRepository.findStudentByUserId(userId);

        if (sinhVien) {
          const registration = await this.activityRepository.findUserRegistration(activity.id, sinhVien.id);

          if (registration) {
            return true;
          }
        }
      }
    }

    // LOP_TRUONG: Also check registration as they are students too
    if (userRole === 'LOP_TRUONG') {
      const userId = user?.sub;
      if (userId) {
        const sinhVien = await this.activityRepository.findStudentByUserId(userId);

        if (sinhVien) {
          const registration = await this.activityRepository.findUserRegistration(activity.id, sinhVien.id);

          if (registration) {
            return true;
          }
        }
      }
    }

    return false;
  }

  private enrichActivity(activity: HoatDong, user: User): HoatDong {
    // Add computed fields if needed
    return activity;
  }
}

export default GetActivityByIdUseCase;
