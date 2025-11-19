/**
 * GetUnreadCountUseCase
 * Use case for getting unread notifications count
 * Follows Single Responsibility Principle (SRP)
 */
class GetUnreadCountUseCase {
  constructor(notificationRepository) {
    this.notificationRepository = notificationRepository;
  }

  async execute(userId) {
    const unreadCount = await this.notificationRepository.countUnread(userId);
    return { unread_count: unreadCount };
  }
}

module.exports = GetUnreadCountUseCase;

