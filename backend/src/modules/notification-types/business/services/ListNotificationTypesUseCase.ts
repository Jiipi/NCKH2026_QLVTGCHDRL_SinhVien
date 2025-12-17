import type INotificationTypeRepository from '../interfaces/INotificationTypeRepository';
import type { NotificationTypeWithCount } from '../interfaces/INotificationTypeRepository';

/**
 * ListNotificationTypesUseCase
 * Use case for listing notification types
 * Follows Single Responsibility Principle (SRP)
 */
class ListNotificationTypesUseCase {
  private notificationTypeRepository: INotificationTypeRepository;

  constructor(notificationTypeRepository: INotificationTypeRepository) {
    this.notificationTypeRepository = notificationTypeRepository;
  }

  async execute(): Promise<NotificationTypeWithCount[]> {
    return await this.notificationTypeRepository.findAll();
  }
}

export default ListNotificationTypesUseCase;
module.exports = ListNotificationTypesUseCase;
