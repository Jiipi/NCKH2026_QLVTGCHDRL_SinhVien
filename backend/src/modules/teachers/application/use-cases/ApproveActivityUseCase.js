const { ForbiddenError } = require('../../../../core/errors/AppError');
const activitiesService = require('../../../activities/activities.service');

/**
 * ApproveActivityUseCase
 * Use case for approving activity
 * Follows Single Responsibility Principle (SRP)
 */
class ApproveActivityUseCase {
  async execute(activityId, user) {
    if (user.role !== 'GIANG_VIEN') {
      throw new ForbiddenError('Chỉ giảng viên mới được duyệt hoạt động');
    }

    return await activitiesService.approve(activityId, user);
  }
}

module.exports = ApproveActivityUseCase;

