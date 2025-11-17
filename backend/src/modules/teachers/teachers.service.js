/**
 * Teachers Service - Business Logic for Teacher Operations
 */

const teachersRepo = require('./teachers.repo');
const activitiesService = require('../activities/activities.service');
const registrationsService = require('../registrations/registrations.service');
const { NotFoundError, ForbiddenError, ValidationError } = require('../../app/errors/AppError');
const { buildScope } = require('../../app/scopes/scopeBuilder');

const teachersService = {
  /**
   * Get teacher dashboard data (V1 compatible)
   * @param {Object} user - User object with id and role
   * @param {string} semester - Optional semester string (e.g., 'hoc_ky_1-2025')
   */
  async getDashboard(user, semester = null, classId = null) {
    if (user.role !== 'GIANG_VIEN') {
      throw new ForbiddenError('Chỉ giảng viên mới được truy cập');
    }

    // Use user.sub (from JWT) or user.id (from middleware)
    const userId = user.sub || user.id;

    const [stats, classes, pendingActivities, pendingRegistrations, students] = await Promise.all([
      teachersRepo.getDashboardStats(userId, semester, classId),
      teachersRepo.getTeacherClasses(userId),
      teachersRepo.getPendingActivitiesList(userId, semester, 5, classId),
      registrationsService.list(user, { status: 'PENDING' }, { page: 1, limit: 5 }),
      teachersRepo.getTeacherStudents(userId, { classId, semester })
    ]);

    return {
      summary: stats,
      pendingActivities,
      pendingRegistrations: pendingRegistrations.data || [],
      classes: classes.map(c => ({
        id: c.id,
        ten_lop: c.ten_lop
      })),
      students: students.map(s => {
        const totalPoints = s.dang_ky_hd?.reduce((sum, dk) => {
          const points = parseFloat(dk.hoat_dong?.diem_rl || 0);
          return sum + points;
        }, 0) || 0;
        
        return {
          id: s.nguoi_dung?.id,
          ho_ten: s.nguoi_dung?.ho_ten,
          avatar: s.nguoi_dung?.anh_dai_dien,
          mssv: s.mssv,
          lop: s.lop?.ten_lop,
          diem_rl: totalPoints
        };
      })
    };
  },

  /**
   * Get teacher's classes
   */
  async getClasses(user) {
    if (user.role !== 'GIANG_VIEN') {
      throw new ForbiddenError('Chỉ giảng viên mới được truy cập');
    }

    // Include shape must match Prisma schema. Use counts only to avoid invalid relation names.
    return await teachersRepo.getTeacherClasses(user.id);
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

    // Build scope for teacher (only activities from their classes)
    const scope = await buildScope('activities', user);

    // Use activities service list(filters, user)
    return await activitiesService.list({
      trangThai: 'cho_duyet',
      scope: { activityFilter: scope },
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

    // Build scope for teacher (only activities from their classes)
    const scope = await buildScope('activities', user);
    
    // Get all activities for teacher (pending + approved + rejected)
    // Then filter client-side or let activitiesService handle it
    const listFilters = {};
    
    // If specifically filtering one status
    if (filters && typeof filters.status === 'string' && ['cho_duyet', 'da_duyet', 'tu_choi'].includes(filters.status)) {
      listFilters.trangThai = filters.status;
    }
    // Otherwise, get all (no filter on trangThai)
    
    if (filters && typeof filters.semester === 'string' && filters.semester) {
      listFilters.semester = filters.semester; // e.g., hoc_ky_1-2025
    }

    // Apply scope filter
    listFilters.scope = { activityFilter: scope };

    return await activitiesService.list({
      ...listFilters,
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
   * Get all registrations for teacher's classes
   */
  async getAllRegistrations(user, filters = {}) {
    if (user.role !== 'GIANG_VIEN') {
      throw new ForbiddenError('Chỉ giảng viên mới được truy cập');
    }

    const { status, semester, classId } = filters;
    
    // Use user.sub (from JWT) or user.id (from middleware)
    const userId = user.sub || user.id;
    
    console.log('[getAllRegistrations] user:', userId, 'filters:', filters);
    
    // Get teacher's classes
    let classes = await teachersRepo.getTeacherClasses(userId);
    console.log('[getAllRegistrations] Found classes:', classes.length);
    
    // Filter by specific class if provided
    if (classId) {
      classes = classes.filter(c => String(c.id) === String(classId));
      console.log('[getAllRegistrations] Filtered to class:', classId, 'found:', classes.length);
    }
    
    if (!classes || classes.length === 0) {
      console.log('[getAllRegistrations] No classes found for teacher');
      return [];
    }
    
    const classIds = classes.map(c => c.id);
    console.log('[getAllRegistrations] Class IDs:', classIds);
    
    // Get all registrations from students in teacher's classes
    const registrations = await teachersRepo.getClassRegistrations(classIds, {
      status,
      semester
    });
    
    console.log('[getAllRegistrations] Found registrations:', registrations.length);
    
    return registrations;
  },

  /**
   * Get pending registrations
   */
  async getPendingRegistrations(user, options = {}) {
    if (user.role !== 'GIANG_VIEN') {
      throw new ForbiddenError('Chỉ giảng viên mới được truy cập');
    }

    const { page, limit, classId, semester, status } = options;
    
    // If classId or semester provided, use getAllRegistrations with filters
    if (classId || semester) {
      const registrations = await this.getAllRegistrations(user, {
        status: status || 'cho_duyet',
        semester,
        classId
      });
      
      // Apply pagination
      const pageNum = parseInt(page) || 1;
      const limitNum = parseInt(limit) || 20;
      const startIdx = (pageNum - 1) * limitNum;
      const endIdx = startIdx + limitNum;
      
      return {
        items: registrations.slice(startIdx, endIdx),
        pagination: {
          page: pageNum,
          limit: limitNum,
          total: registrations.length,
          totalPages: Math.ceil(registrations.length / limitNum)
        }
      };
    }
    
    // Use registrations service for default behavior
    return await registrationsService.list(user, {
      status: 'PENDING'
    }, { page, limit });
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





