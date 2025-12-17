import { NotFoundError } from '../../../../core/errors/AppError';
import { logError } from '../../../../core/logger';
import type INotificationRepository from '../interfaces/INotificationRepository';
import type { HoatDong } from '@prisma/client';

interface RecipientInfo {
  ho_ten: string | null;
  email: string;
}

interface SentNotificationDetailResult {
  id: string;
  title: string;
  message: string;
  scope: string;
  date: Date;
  recipients: number;
  recipientsList: RecipientInfo[];
  activity: HoatDong | null;
  status: string;
}

/**
 * GetSentNotificationDetailUseCase
 * Use case for getting sent notification detail
 * Follows Single Responsibility Principle (SRP)
 */
class GetSentNotificationDetailUseCase {
  private notificationRepository: INotificationRepository;

  constructor(notificationRepository: INotificationRepository) {
    this.notificationRepository = notificationRepository;
  }

  async execute(notificationId: string, userId: string): Promise<SentNotificationDetailResult> {
    const notification = await this.notificationRepository.findByIdForUser(notificationId, userId, 'sent');

    if (!notification) {
      throw new NotFoundError('Không tìm thấy thông báo');
    }

    const allNotifications = await this.notificationRepository.findSentNotificationsBatch(
      userId,
      notification.tieu_de,
      notification.ngay_gui
    );

    let activity: HoatDong | null = null;
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

export default GetSentNotificationDetailUseCase;
module.exports = GetSentNotificationDetailUseCase;
