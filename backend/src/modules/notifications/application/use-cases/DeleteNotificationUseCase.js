const { NotFoundError } = require('../../../../core/errors/AppError');

/**
 * DeleteNotificationUseCase
 * Use case for deleting notification
 * Follows Single Responsibility Principle (SRP)
 */
class DeleteNotificationUseCase {
  constructor(notificationRepository) {
    this.notificationRepository = notificationRepository;
  }

  async execute(notificationId, userId) {
    const notification = await this.notificationRepository.findByIdForUser(notificationId, userId, 'received');

    if (!notification) {
      throw new NotFoundError('Không tìm thấy thông báo');
    }

    await this.notificationRepository.delete(notificationId);
    return { message: 'Đã xóa thông báo' };
  }
}

module.exports = DeleteNotificationUseCase;

