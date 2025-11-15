/**
 * Teachers Service - Business Logic for Teacher Operations
 */

const teachersRepo = require('./teachers.repo');
const activitiesService = require('../activities/activities.service');
const registrationsService = require('../registrations/registrations.service');
const { NotFoundError, ForbiddenError, ValidationError } = require('../../app/errors/AppError');

const teachersService = {
  /**
   * Get teacher dashboard data (V1 compatible)
   * @param {Object} user - User object with id and role
   * @param {Object} semesterFilter - Optional filter { hoc_ky, nam_hoc }
   */
  async getDashboard(user, semesterFilter = {}) {
    if (user.role !== 'GIANG_VIEN') {
      throw new ForbiddenError('Chỉ giảng viên mới được truy cập');
    }

    const [stats, classes, pendingActivities, recentNotifications] = await Promise.all([
      teachersRepo.getDashboardStats(user.id, semesterFilter),
      teachersRepo.getTeacherClasses(user.id),
      teachersRepo.getPendingActivitiesList(user.id, semesterFilter, 5),
      teachersRepo.getRecentNotifications(user.id, 5)
    ]);

    return {
      summary: stats,
      pendingActivities,
      recentNotifications,
      classes: classes.map(c => ({
        id: c.id,
        ten_lop: c.ten_lop
      }))
    };
  },

  /**
   * Get teacher's classes
   */
  async getClasses(user) {
    if (user.role !== 'GIANG_VIEN') {
      throw new ForbiddenError('Chỉ giảng viên mới được truy cập');
    }

    return await teachersRepo.getTeacherClasses(user.id, {
      students: {
        select: {
          id: true,
          mssv: true,
          fullName: true
        }
      }
    });
  },

  /**
   * Get students in teacher's classes
   */
  async getStudents(user, filters = {}) {
    if (user.role !== 'GIANG_VIEN') {
      throw new ForbiddenError('Chỉ giảng viên mới được truy cập');
    }

    const students = await teachersRepo.getTeacherStudents(user.id, filters);

    // Remove sensitive data
    students.forEach(s => delete s.password);

    return students;
  },

  /**
   * Get pending activities from teacher's classes
   */
  async getPendingActivities(user, pagination = {}) {
    if (user.role !== 'GIANG_VIEN') {
      throw new ForbiddenError('Chỉ giảng viên mới được truy cập');
    }

    // Use activities service list(filters, user)
    return await activitiesService.list({
      trangThai: 'cho_duyet',
      page: pagination.page,
      limit: pagination.limit
    }, user);
  },

  /**
   * Get activity history
   */
  async getActivityHistory(user, filters = {}, pagination = {}) {
    if (user.role !== 'GIANG_VIEN') {
      throw new ForbiddenError('Chỉ giảng viên mới được truy cập');
    }

    return await activitiesService.list({
      trangThai: { in: ['da_duyet', 'tu_choi'] },
      ...filters,
      page: pagination.page,
      limit: pagination.limit
    }, user);
  },

  /**
   * Approve activity
   */
  async approveActivity(activityId, user) {
    if (user.role !== 'GIANG_VIEN') {
      throw new ForbiddenError('Chỉ giảng viên mới được duyệt hoạt động');
    }

    // V1 behavior: Teachers can approve ANY activity, not just their class students
    // No hasAccessToActivity() check needed here
    // Permission check happens via RBAC middleware in routes

    return await activitiesService.approve(activityId, user);
  },

  /**
   * Reject activity
   */
  async rejectActivity(activityId, reason, user) {
    if (user.role !== 'GIANG_VIEN') {
      throw new ForbiddenError('Chỉ giảng viên mới được từ chối hoạt động');
    }

    // V1 behavior: Teachers can reject ANY activity, not just their class students
    // No hasAccessToActivity() check needed here
    // Permission check happens via RBAC middleware in routes

    return await activitiesService.reject(activityId, reason, user);
  },

  /**
   * Get pending registrations
   */
  async getPendingRegistrations(user, pagination = {}) {
    if (user.role !== 'GIANG_VIEN') {
      throw new ForbiddenError('Chỉ giảng viên mới được truy cập');
    }

    return await registrationsService.list(user, {
      status: 'PENDING'
    }, pagination);
  },

  /**
   * Approve registration
   */
  async approveRegistration(regId, user) {
    if (user.role !== 'GIANG_VIEN') {
      throw new ForbiddenError('Chỉ giảng viên mới được duyệt đăng ký');
    }

    return await registrationsService.approve(regId, user);
  },

  /**
   * Reject registration
   */
  async rejectRegistration(regId, reason, user) {
    if (user.role !== 'GIANG_VIEN') {
      throw new ForbiddenError('Chỉ giảng viên mới được từ chối đăng ký');
    }

    return await registrationsService.reject(regId, reason, user);
  },

  /**
   * Bulk approve registrations
   */
  async bulkApproveRegistrations(regIds, user) {
    if (user.role !== 'GIANG_VIEN') {
      throw new ForbiddenError('Chỉ giảng viên mới được duyệt đăng ký');
    }

    return await registrationsService.bulkApprove(regIds, user);
  },

  /**
   * Get class statistics
   */
  async getClassStatistics(className, semesterId, user) {
    if (user.role !== 'GIANG_VIEN') {
      throw new ForbiddenError('Chỉ giảng viên mới được xem thống kê');
    }

    // Check access
    const hasAccess = await teachersRepo.hasAccessToClass(user.id, className);
    if (!hasAccess) {
      throw new ForbiddenError('Bạn không có quyền xem lớp này');
    }

    return await teachersRepo.getClassStats(className, semesterId);
  },

  /**
   * Export students list
   */
  async exportStudents(user) {
    if (user.role !== 'GIANG_VIEN') {
      throw new ForbiddenError('Chỉ giảng viên mới được export');
    }

    return await teachersRepo.exportStudents(user.id);
  },

  /**
   * Get statistics for reports
   */
  async getReportStatistics(user, filters = {}) {
    if (user.role !== 'GIANG_VIEN') {
      throw new ForbiddenError('Chỉ giảng viên mới được xem báo cáo');
    }

    const classNames = await teachersRepo.getTeacherClassNames(user.id);

    // Get aggregated stats for all teacher's classes
    const stats = await Promise.all(
      classNames.map(className => 
        teachersRepo.getClassStats(className, filters.semesterId)
      )
    );

    return {
      classNames,
      stats,
      summary: {
        totalStudents: stats.reduce((sum, s) => sum + s.totalStudents, 0),
        totalActivities: stats.reduce((sum, s) => sum + s.totalActivities, 0),
        approvedActivities: stats.reduce((sum, s) => sum + s.approvedActivities, 0),
        totalRegistrations: stats.reduce((sum, s) => sum + s.totalRegistrations, 0),
        approvedRegistrations: stats.reduce((sum, s) => sum + s.approvedRegistrations, 0)
      }
    };
  }
};

module.exports = teachersService;





