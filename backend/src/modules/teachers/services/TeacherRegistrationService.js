/**
 * Teacher Registration Service
 * Handles registration operations for teachers
 * Follows Single Responsibility Principle (SRP)
 */

const teachersRepo = require('../teachers.repo');
const registrationsService = require('../../registrations/registrations.service');
const { ForbiddenError } = require('../../../core/errors/AppError');

const getUserId = (user) => user?.sub || user?.id;

class TeacherRegistrationService {
  /**
   * Get all registrations for teacher's classes
   */
  async getAllRegistrations(user, filters = {}) {
    if (user.role !== 'GIANG_VIEN') {
      throw new ForbiddenError('Chỉ giảng viên mới được truy cập');
    }

    const { status, semester, classId } = filters;
    
    // Use user.sub (from JWT) or user.id (from middleware)
    const userId = getUserId(user);
    
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
  }

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
  }

  /**
   * Approve registration
   */
  async approveRegistration(regId, user) {
    if (user.role !== 'GIANG_VIEN') {
      throw new ForbiddenError('Chỉ giảng viên mới được duyệt đăng ký');
    }

    return await registrationsService.approve(regId, user);
  }

  /**
   * Reject registration
   */
  async rejectRegistration(regId, reason, user) {
    if (user.role !== 'GIANG_VIEN') {
      throw new ForbiddenError('Chỉ giảng viên mới được từ chối đăng ký');
    }

    return await registrationsService.reject(regId, reason, user);
  }

  /**
   * Bulk approve registrations
   */
  async bulkApproveRegistrations(regIds, user) {
    if (user.role !== 'GIANG_VIEN') {
      throw new ForbiddenError('Chỉ giảng viên mới được duyệt đăng ký');
    }

    return await registrationsService.bulkApprove(regIds, user);
  }
}

module.exports = TeacherRegistrationService;

