/**
 * Teacher Query Service
 * Handles querying teacher data (classes, students, activities)
 * Follows Single Responsibility Principle (SRP)
 */

const teachersRepo = require('../teachers.repo');
const activitiesService = require('../../activities/activities.service');
const { buildScope } = require('../../../app/scopes/scopeBuilder');
const { ForbiddenError } = require('../../../core/errors/AppError');

const getUserId = (user) => user?.sub || user?.id;

class TeacherQueryService {
  /**
   * Get teacher's classes
   */
  async getClasses(user) {
    if (user.role !== 'GIANG_VIEN') {
      throw new ForbiddenError('Chỉ giảng viên mới được truy cập');
    }

    // Include shape must match Prisma schema. Use counts only to avoid invalid relation names.
    const userId = getUserId(user);
    return await teachersRepo.getTeacherClasses(userId);
  }

  /**
   * Get students in teacher's classes
   */
  async getStudents(user, filters = {}) {
    if (user.role !== 'GIANG_VIEN') {
      throw new ForbiddenError('Chỉ giảng viên mới được truy cập');
    }

    const userId = getUserId(user);
    const students = await teachersRepo.getTeacherStudents(userId, filters);

    // Remove sensitive data
    students.forEach(s => delete s.password);

    return students;
  }

  /**
   * Get pending activities from teacher's classes
   */
  async getPendingActivities(user, pagination = {}) {
    if (user.role !== 'GIANG_VIEN') {
      throw new ForbiddenError('Chỉ giảng viên mới được truy cập');
    }

    // Build scope for teacher (only activities from their classes)
    const scope = await buildScope('activities', user);

    // Extract semester from pagination object, default limit to 100
    const { semester, page = 1, limit = 100 } = pagination;
    
    const listFilters = {
      trangThai: 'cho_duyet',
      scope: { activityFilter: scope }
    };
    
    // Add semester filter if provided
    if (semester) {
      listFilters.semester = semester;
    }

    // Use activities service list(filters, user)
    return await activitiesService.list({
      ...listFilters,
      page,
      limit
    }, user);
  }

  /**
   * Get activity history
   */
  async getActivityHistory(user, filters = {}, pagination = {}) {
    if (user.role !== 'GIANG_VIEN') {
      throw new ForbiddenError('Chỉ giảng viên mới được truy cập');
    }

    // Default limit to 100 for teacher pages
    const { page = 1, limit = 100 } = pagination;

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
      page,
      limit
    }, user);
  }
}

module.exports = TeacherQueryService;

