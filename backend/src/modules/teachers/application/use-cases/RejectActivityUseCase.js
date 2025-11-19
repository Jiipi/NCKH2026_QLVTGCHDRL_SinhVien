const { ForbiddenError } = require('../../../../core/errors/AppError');
const activitiesService = require('../../../activities/activities.service');

/**
 * RejectActivityUseCase
 * Use case for rejecting activity
 * Follows Single Responsibility Principle (SRP)
 */
class RejectActivityUseCase {
  async execute(activityId, reason, user) {
    if (user.role !== 'GIANG_VIEN') {
      throw new ForbiddenError('Chỉ giảng viên mới được từ chối hoạt động');
    }

    return await activitiesService.reject(activityId, reason, user);
  }
}

module.exports = RejectActivityUseCase;

