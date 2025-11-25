const { NotFoundError } = require('../../../../core/errors/AppError');
const activitiesRepo = require('../../data/repositories/activities.repository');
const { normalizeRole } = require('../../../../core/utils/roleHelper');

/**
 * GetActivityDetailsUseCase
 * Use case for getting activity details with registrations
 * Follows Single Responsibility Principle (SRP)
 */
class GetActivityDetailsUseCase {
  constructor(activityRepository) {
    this.activityRepository = activityRepository;
  }

  async execute(id, user) {
    const activity = await activitiesRepo.findByIdWithDetails(id);
    
    if (!activity) {
      throw new NotFoundError('Hoạt động không tồn tại');
    }
    
    // Enrich activity with user-specific fields
    return this.enrichActivity(activity, user);
  }

  enrichActivity(activity, user) {
    const userRole = user ? normalizeRole(user.role) : null;
    const userId = user?.sub || null;
    
    const enriched = {
      ...activity,
      is_creator: userId ? (activity.nguoi_tao_id === userId) : false,
      can_edit: userId ? (activity.nguoi_tao_id === userId || ['ADMIN', 'GIANG_VIEN'].includes(userRole)) : false,
      can_delete: userRole ? ['ADMIN', 'GIANG_VIEN'].includes(userRole) : false
    };
    
    return enriched;
  }
}

module.exports = GetActivityDetailsUseCase;

