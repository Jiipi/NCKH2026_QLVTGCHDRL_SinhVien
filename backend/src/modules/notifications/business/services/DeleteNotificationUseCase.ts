import { NotFoundError } from '../../../../core/errors/AppError';
import type INotificationRepository from '../interfaces/INotificationRepository';

interface DeleteNotificationResult {
  message: string;
}

/**
 * DeleteNotificationUseCase
 * Use case for deleting notification
 * Follows Single Responsibility Principle (SRP)
 */
class DeleteNotificationUseCase {
  private notificationRepository: INotificationRepository;

  constructor(notificationRepository: INotificationRepository) {
    this.notificationRepository = notificationRepository;
  }

  async execute(notificationId: string, userId: string): Promise<DeleteNotificationResult> {
    const notification = await this.notificationRepository.findByIdForUser(notificationId, userId, 'received');

    if (!notification) {
      throw new NotFoundError('Không tìm thấy thông báo');
    }

    await this.notificationRepository.delete(notificationId);
    return { message: 'Đã xóa thông báo' };
  }
}

export default DeleteNotificationUseCase;
module.exports = DeleteNotificationUseCase;
