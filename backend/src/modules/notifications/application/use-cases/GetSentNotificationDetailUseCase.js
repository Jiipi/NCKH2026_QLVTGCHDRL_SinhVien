const { NotFoundError } = require('../../../../core/errors/AppError');
const { logError } = require('../../../../core/logger');

/**
 * GetSentNotificationDetailUseCase
 * Use case for getting sent notification detail
 * Follows Single Responsibility Principle (SRP)
 */
class GetSentNotificationDetailUseCase {
  constructor(notificationRepository) {
    this.notificationRepository = notificationRepository;
  }

  async execute(notificationId, userId) {
    const notification = await this.notificationRepository.findByIdForUser(notificationId, userId, 'sent');

    if (!notification) {
      throw new NotFoundError('Không tìm thấy thông báo');
    }

    const allNotifications = await this.notificationRepository.findSentNotificationsBatch(
      userId,
      notification.tieu_de,
      notification.ngay_gui
    );

    let activity = null;
    let scope = 'class';

    try {
      const activityMatch = notification.noi_dung.match(/hd_id\s*:\s*([0-9a-fA-F-]{36})/);
      const scopeMatch = notification.noi_dung.match(/phạm vi:\s*(class|activity|single)/i);

      if (scopeMatch) {
        scope = scopeMatch[1].toLowerCase();
      }

      if (activityMatch) {
        activity = await this.notificationRepository.findActivity({ id: activityMatch[1] });
      }
    } catch (error) {
      logError('Error extracting activity from sent notification:', error);
    }

    return {
      id: notification.id,
      title: notification.tieu_de,
      message: notification.noi_dung,
      scope,
      date: notification.ngay_gui,
      recipients: allNotifications.length,
      recipientsList: allNotifications.map(n => n.nguoi_nhan),
      activity,
      status: notification.trang_thai_gui || 'da_gui'
    };
  }
}

module.exports = GetSentNotificationDetailUseCase;

