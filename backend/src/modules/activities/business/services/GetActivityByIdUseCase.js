const { NotFoundError } = require('../../../../core/errors/AppError');

/**
 * GetActivityByIdUseCase
 * Use case for retrieving a single activity by ID
 * Follows Single Responsibility Principle (SRP)
 */
class GetActivityByIdUseCase {
  constructor(activityRepository) {
    this.activityRepository = activityRepository;
  }

  async execute(id, scope, user) {
    const where = {};
    
    // Apply scope filter from middleware
    if (scope && scope.activityFilter) {
      Object.assign(where, scope.activityFilter);
    }

    const activity = await this.activityRepository.findById(id, where);

    if (!activity) {
      throw new NotFoundError('Không tìm thấy hoạt động');
    }

    return this.enrichActivity(activity, user);
  }

  enrichActivity(activity, user) {
    // Add computed fields if needed
    return activity;
  }
}

module.exports = GetActivityByIdUseCase;

