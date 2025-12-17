import type INotificationRepository from '../interfaces/INotificationRepository';

interface GetUnreadCountResult {
  unread_count: number;
}

/**
 * GetUnreadCountUseCase
 * Use case for getting unread notifications count
 * Follows Single Responsibility Principle (SRP)
 */
class GetUnreadCountUseCase {
  private notificationRepository: INotificationRepository;

  constructor(notificationRepository: INotificationRepository) {
    this.notificationRepository = notificationRepository;
  }

  async execute(userId: string): Promise<GetUnreadCountResult> {
    const unreadCount = await this.notificationRepository.countUnread(userId);
    return { unread_count: unreadCount };
  }
}

export default GetUnreadCountUseCase;
module.exports = GetUnreadCountUseCase;
