const { NotFoundError, ForbiddenError } = require('../../../../core/errors/AppError');
const { prisma } = require('../../../../data/infrastructure/prisma/client');

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
  constructor(activityRepository) {
    this.activityRepository = activityRepository;
  }

  async execute(id, scope, user) {
    // First, fetch the activity without scope filter
    const activity = await this.activityRepository.findById(id);

    if (!activity) {
      throw new NotFoundError('Không tìm thấy hoạt động');
    }

    // Check access based on user role
    const hasAccess = await this.checkAccess(activity, scope, user);
    
    if (!hasAccess) {
      throw new NotFoundError('Không tìm thấy hoạt động');
    }

    return this.enrichActivity(activity, user);
  }

  /**
   * Check if user has access to view the activity
   */
  async checkAccess(activity, scope, user) {
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
    if (userRole === 'GIANG_VIEN' && scope?.teacherOf?.length > 0) {
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
        const sinhVien = await prisma.sinhVien.findUnique({
          where: { nguoi_dung_id: userId },
          select: { id: true }
        });

        if (sinhVien) {
          const registration = await prisma.dangKyHoatDong.findFirst({
            where: {
              hoat_dong_id: activity.id,
              sinh_vien_id: sinhVien.id
            }
          });

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
        const sinhVien = await prisma.sinhVien.findUnique({
          where: { nguoi_dung_id: userId },
          select: { id: true }
        });

        if (sinhVien) {
          const registration = await prisma.dangKyHoatDong.findFirst({
            where: {
              hoat_dong_id: activity.id,
              sinh_vien_id: sinhVien.id
            }
          });

          if (registration) {
            return true;
          }
        }
      }
    }

    return false;
  }

  enrichActivity(activity, user) {
    // Add computed fields if needed
    return activity;
  }
}

module.exports = GetActivityByIdUseCase;

