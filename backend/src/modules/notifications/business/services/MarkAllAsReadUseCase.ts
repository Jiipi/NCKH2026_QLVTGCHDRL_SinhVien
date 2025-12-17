import type INotificationRepository from '../interfaces/INotificationRepository';

interface MarkAllAsReadResult {
  message: string;
}

/**
 * MarkAllAsReadUseCase
 * Use case for marking all notifications as read
 * Follows Single Responsibility Principle (SRP)
 */
class MarkAllAsReadUseCase {
  private notificationRepository: INotificationRepository;

  constructor(notificationRepository: INotificationRepository) {
    this.notificationRepository = notificationRepository;
  }

  async execute(userId: string): Promise<MarkAllAsReadResult> {
    await this.notificationRepository.markAllAsRead(userId);
    return { message: 'Đã đánh dấu tất cả thông báo đã đọc' };
  }
}

export default MarkAllAsReadUseCase;
module.exports = MarkAllAsReadUseCase;
