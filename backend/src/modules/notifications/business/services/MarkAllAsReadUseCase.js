/**
 * MarkAllAsReadUseCase
 * Use case for marking all notifications as read
 * Follows Single Responsibility Principle (SRP)
 */
class MarkAllAsReadUseCase {
  constructor(notificationRepository) {
    this.notificationRepository = notificationRepository;
  }

  async execute(userId) {
    await this.notificationRepository.markAllAsRead(userId);
    return { message: 'Đã đánh dấu tất cả thông báo đã đọc' };
  }
}

module.exports = MarkAllAsReadUseCase;

