import type INotificationRepository from '../interfaces/INotificationRepository';

interface GetUserNotificationsQuery {
  page?: number | string;
  limit?: number | string;
  unread_only?: boolean | string;
}

interface FormattedNotification {
  id: string;
  title: string;
  message: string;
  type: string;
  priority: string;
  unread: boolean;
  time: Date;
  sender: string;
  method: string;
}

interface GetUserNotificationsResult {
  notifications: FormattedNotification[];
  pagination: {
    current_page: number;
    per_page: number;
    total: number;
    total_pages: number;
  };
  unread_count: number;
}

/**
 * GetUserNotificationsUseCase
 * Use case for getting user's received notifications
 * Follows Single Responsibility Principle (SRP)
 */
class GetUserNotificationsUseCase {
  private notificationRepository: INotificationRepository;

  constructor(notificationRepository: INotificationRepository) {
    this.notificationRepository = notificationRepository;
  }

  async execute(userId: string, query: GetUserNotificationsQuery): Promise<GetUserNotificationsResult> {
    const { page = 1, limit = 20, unread_only = false } = query;

    const filters = {
      nguoi_nhan_id: userId,
      da_doc: unread_only ? false : undefined
    };

    const pageNum = typeof page === 'string' ? parseInt(page) : page;
    const limitNum = typeof limit === 'string' ? parseInt(limit) : limit;

    const { data: notifications, total } = await this.notificationRepository.findNotifications(
      filters, 
      { page: pageNum, limit: limitNum }
    );
    const unreadCount = await this.notificationRepository.countUnread(userId);

    const formattedNotifications: FormattedNotification[] = notifications.map(notification => ({
      id: notification.id,
      title: notification.tieu_de,
      message: notification.noi_dung,
      type: notification.loai_tb.ten_loai_tb.toLowerCase(),
      priority: notification.muc_do_uu_tien,
      unread: !notification.da_doc,
      time: notification.ngay_gui,
      sender: notification.nguoi_gui.ho_ten || notification.nguoi_gui.email,
      method: notification.phuong_thuc_gui
    }));

    return {
      notifications: formattedNotifications,
      pagination: {
        current_page: pageNum,
        per_page: limitNum,
        total,
        total_pages: Math.ceil(total / limitNum)
      },
      unread_count: unreadCount
    };
  }
}

export default GetUserNotificationsUseCase;
module.exports = GetUserNotificationsUseCase;
