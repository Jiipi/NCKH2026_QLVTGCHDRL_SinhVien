const { ValidationError } = require('../../../../core/errors/AppError');

/**
 * DeleteNotificationTypeUseCase
 * Use case for deleting notification type
 * Follows Single Responsibility Principle (SRP)
 */
class DeleteNotificationTypeUseCase {
  constructor(notificationTypeRepository) {
    this.notificationTypeRepository = notificationTypeRepository;
  }

  async execute(id) {
    // Check if type is being used
    const count = await this.notificationTypeRepository.countNotificationsUsingType(id);

    if (count > 0) {
      throw new ValidationError('Không thể xóa. Loại thông báo đang được sử dụng');
    }

    await this.notificationTypeRepository.delete(id);
    return true;
  }
}

module.exports = DeleteNotificationTypeUseCase;

