const { ValidationError } = require('../../../../core/errors/AppError');
const CreateNotificationTypeDto = require('../dto/CreateNotificationTypeDto');

/**
 * CreateNotificationTypeUseCase
 * Use case for creating notification type
 * Follows Single Responsibility Principle (SRP)
 */
class CreateNotificationTypeUseCase {
  constructor(notificationTypeRepository) {
    this.notificationTypeRepository = notificationTypeRepository;
  }

  async execute(data) {
    const { ten_loai_tb, mo_ta } = CreateNotificationTypeDto.fromRequest(data);

    // Check for duplicates
    const exists = await this.notificationTypeRepository.findByName(ten_loai_tb);
    
    if (exists) {
      throw new ValidationError('Loại thông báo đã tồn tại');
    }

    const item = await this.notificationTypeRepository.create({ ten_loai_tb, mo_ta });
    return item;
  }
}

module.exports = CreateNotificationTypeUseCase;

