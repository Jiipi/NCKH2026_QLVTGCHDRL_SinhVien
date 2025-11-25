const { NotFoundError } = require('../../../../core/errors/AppError');

/**
 * MarkAsReadUseCase
 * Use case for marking notification as read
 * Follows Single Responsibility Principle (SRP)
 */
class MarkAsReadUseCase {
  constructor(notificationRepository) {
    this.notificationRepository = notificationRepository;
  }

  async execute(notificationId, userId) {
    const notification = await this.notificationRepository.findByIdForUser(notificationId, userId, 'received');

    if (!notification) {
      throw new NotFoundError('Không tìm thấy thông báo');
    }

    await this.notificationRepository.markAsRead(notificationId);
    return { message: 'Đã đánh dấu thông báo đã đọc' };
  }
}

module.exports = MarkAsReadUseCase;

