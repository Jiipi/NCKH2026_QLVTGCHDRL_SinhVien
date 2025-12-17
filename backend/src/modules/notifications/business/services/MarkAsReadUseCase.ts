import type INotificationRepository from '../interfaces/INotificationRepository';
const { NotFoundError } = require('../../../../core/errors/AppError');

interface MarkAsReadResult {
  message: string;
}

/**
 * MarkAsReadUseCase
 * Use case for marking notification as read
 * Follows Single Responsibility Principle (SRP)
 */
class MarkAsReadUseCase {
  private notificationRepository: INotificationRepository;

  constructor(notificationRepository: INotificationRepository) {
    this.notificationRepository = notificationRepository;
  }

  async execute(notificationId: string, userId: string): Promise<MarkAsReadResult> {
    const notification = await this.notificationRepository.findByIdForUser(notificationId, userId, 'received');

    if (!notification) {
      throw new NotFoundError('Không tìm thấy thông báo');
    }

    await this.notificationRepository.markAsRead(notificationId);
    return { message: 'Đã đánh dấu thông báo đã đọc' };
  }
}

export default MarkAsReadUseCase;
module.exports = MarkAsReadUseCase;
