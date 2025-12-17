import { NotFoundError } from '../../../../core/errors/AppError';
import type INotificationTypeRepository from '../interfaces/INotificationTypeRepository';
import type { NotificationTypeWithCount } from '../interfaces/INotificationTypeRepository';

/**
 * GetNotificationTypeByIdUseCase
 * Use case for getting notification type by ID
 * Follows Single Responsibility Principle (SRP)
 */
class GetNotificationTypeByIdUseCase {
  private notificationTypeRepository: INotificationTypeRepository;

  constructor(notificationTypeRepository: INotificationTypeRepository) {
    this.notificationTypeRepository = notificationTypeRepository;
  }

  async execute(id: string): Promise<NotificationTypeWithCount> {
    const type = await this.notificationTypeRepository.findById(id);

    if (!type) {
      throw new NotFoundError('Không tìm thấy loại thông báo');
    }

    return type;
  }
}

export default GetNotificationTypeByIdUseCase;
module.exports = GetNotificationTypeByIdUseCase;
