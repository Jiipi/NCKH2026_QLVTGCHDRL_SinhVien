/**
 * Teacher Activity Service
 * Handles activity approval/rejection operations for teachers
 * Follows Single Responsibility Principle (SRP)
 */

const activitiesService = require('../../activities/activities.service');
const { ForbiddenError } = require('../../../core/errors/AppError');

class TeacherActivityService {
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
  }

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
  }
}

module.exports = TeacherActivityService;

