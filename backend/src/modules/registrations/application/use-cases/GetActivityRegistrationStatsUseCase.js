const { NotFoundError, ForbiddenError } = require('../../../../core/errors/AppError');
const { prisma } = require('../../../../infrastructure/prisma/client');
const { canManageActivity } = require('../helpers/registrationAccess');

/**
 * GetActivityRegistrationStatsUseCase
 * Use case for retrieving registration stats of an activity
 */
class GetActivityRegistrationStatsUseCase {
  constructor(registrationRepository) {
    this.registrationRepository = registrationRepository;
  }

  async execute(activityId, user) {
    const activity = await prisma.activity.findUnique({
      where: { id: parseInt(activityId, 10) }
    });

    if (!activity) {
      throw new NotFoundError('Hoạt động không tồn tại');
    }

    const canView = await canManageActivity(activity, user);
    if (!canView && user.role !== 'SINH_VIEN') {
      throw new ForbiddenError('Không có quyền xem thống kê');
    }

    const stats = await this.registrationRepository.getActivityStats(activityId);
    return stats;
  }
}

module.exports = GetActivityRegistrationStatsUseCase;

