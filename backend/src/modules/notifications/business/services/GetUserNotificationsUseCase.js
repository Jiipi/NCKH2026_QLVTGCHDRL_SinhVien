/**
 * GetUserNotificationsUseCase
 * Use case for getting user's received notifications
 * Follows Single Responsibility Principle (SRP)
 */
class GetUserNotificationsUseCase {
  constructor(notificationRepository) {
    this.notificationRepository = notificationRepository;
  }

  async execute(userId, query) {
    const { page = 1, limit = 20, unread_only = false } = query;

    const filters = {
      nguoi_nhan_id: userId,
      unread_only
    };

    const { notifications, total } = await this.notificationRepository.findNotifications(filters, { page, limit });
    const unreadCount = await this.notificationRepository.countUnread(userId);

    const formattedNotifications = notifications.map(notification => ({
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
        current_page: parseInt(page),
        per_page: parseInt(limit),
        total,
        total_pages: Math.ceil(total / parseInt(limit))
      },
      unread_count: unreadCount
    };
  }
}

module.exports = GetUserNotificationsUseCase;

