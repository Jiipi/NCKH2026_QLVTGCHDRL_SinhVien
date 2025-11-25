const { NotFoundError } = require('../../../../core/errors/AppError');

/**
 * GetNotificationTypeByIdUseCase
 * Use case for getting notification type by ID
 * Follows Single Responsibility Principle (SRP)
 */
class GetNotificationTypeByIdUseCase {
  constructor(notificationTypeRepository) {
    this.notificationTypeRepository = notificationTypeRepository;
  }

  async execute(id) {
    const type = await this.notificationTypeRepository.findById(id);

    if (!type) {
      throw new NotFoundError('Không tìm thấy loại thông báo');
    }

    return type;
  }
}

module.exports = GetNotificationTypeByIdUseCase;

