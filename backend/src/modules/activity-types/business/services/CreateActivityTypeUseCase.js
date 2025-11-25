const { ValidationError } = require('../../../../core/errors/AppError');
const CreateActivityTypeDto = require('../dto/CreateActivityTypeDto');
const { logInfo } = require('../../../../core/logger');

/**
 * CreateActivityTypeUseCase
 * Use case for creating activity type
 * Follows Single Responsibility Principle (SRP)
 */
class CreateActivityTypeUseCase {
  constructor(activityTypeRepository) {
    this.activityTypeRepository = activityTypeRepository;
  }

  async execute(data, adminId) {
    const validatedData = CreateActivityTypeDto.fromRequest(data);

    // Check for duplicate
    const existing = await this.activityTypeRepository.findByName(validatedData.ten_loai_hd);
    if (existing) {
      throw new ValidationError('Loại hoạt động đã tồn tại');
    }

    // Create activity type
    const activityType = await this.activityTypeRepository.create(validatedData);

    logInfo(`Admin ${adminId} created activity type: ${validatedData.ten_loai_hd}`);

    return activityType;
  }
}

module.exports = CreateActivityTypeUseCase;

