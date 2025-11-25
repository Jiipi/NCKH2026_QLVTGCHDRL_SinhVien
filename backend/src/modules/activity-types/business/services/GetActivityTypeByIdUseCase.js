const { NotFoundError } = require('../../../../core/errors/AppError');

/**
 * GetActivityTypeByIdUseCase
 * Use case for getting activity type by ID
 * Follows Single Responsibility Principle (SRP)
 */
class GetActivityTypeByIdUseCase {
  constructor(activityTypeRepository) {
    this.activityTypeRepository = activityTypeRepository;
  }

  async execute(id) {
    const activityType = await this.activityTypeRepository.findById(id);
    
    if (!activityType) {
      throw new NotFoundError('Không tìm thấy loại hoạt động');
    }

    return activityType;
  }
}

module.exports = GetActivityTypeByIdUseCase;

