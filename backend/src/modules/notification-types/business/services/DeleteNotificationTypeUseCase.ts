import { ValidationError } from '../../../../core/errors/AppError';
import type INotificationTypeRepository from '../interfaces/INotificationTypeRepository';

/**
 * DeleteNotificationTypeUseCase
 * Use case for deleting notification type
 * Follows Single Responsibility Principle (SRP)
 */
class DeleteNotificationTypeUseCase {
  private notificationTypeRepository: INotificationTypeRepository;

  constructor(notificationTypeRepository: INotificationTypeRepository) {
    this.notificationTypeRepository = notificationTypeRepository;
  }

  async execute(id: string): Promise<boolean> {
    // Check if type is being used
    const count = await this.notificationTypeRepository.countNotificationsUsingType(id);

    if (count > 0) {
      throw new ValidationError('Không thể xóa. Loại thông báo đang được sử dụng');
    }

    await this.notificationTypeRepository.delete(id);
    return true;
  }
}

export default DeleteNotificationTypeUseCase;
module.exports = DeleteNotificationTypeUseCase;
