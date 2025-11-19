/**
 * GetSentNotificationsUseCase
 * Use case for getting sent notifications history
 * Follows Single Responsibility Principle (SRP)
 */
class GetSentNotificationsUseCase {
  constructor(notificationRepository) {
    this.notificationRepository = notificationRepository;
  }

  async execute(userId, query) {
    const { page = 1, limit = 20 } = query;

    const filters = {
      nguoi_gui_id: userId
    };

    const { notifications, total } = await this.notificationRepository.findNotifications(filters, { page, limit });

    const groupedNotifications = {};
    for (const notif of notifications) {
      const key = `${notif.tieu_de}_${notif.ngay_gui.toDateString()}`;
      
      if (!groupedNotifications[key]) {
        groupedNotifications[key] = {
          id: notif.id,
          title: notif.tieu_de,
          message: notif.noi_dung,
          date: notif.ngay_gui,
          recipients: [],
          scope: null,
          activityId: null
        };

        const scopeMatch = notif.noi_dung.match(/phạm vi:\s*(class|activity|single)/i);
        const activityMatch = notif.noi_dung.match(/hd_id\s*:\s*([0-9a-fA-F-]{36})/);

        if (scopeMatch) {
          groupedNotifications[key].scope = scopeMatch[1].toLowerCase();
        }
        if (activityMatch) {
          groupedNotifications[key].activityId = activityMatch[1];
        }
      }
      
      groupedNotifications[key].recipients.push(notif.nguoi_nhan);
    }

    const formattedHistory = Object.values(groupedNotifications).map(item => ({
      id: item.id,
      title: item.title,
      message: item.message,
      scope: item.scope || 'class',
      date: item.date,
      recipients: item.recipients.length,
      recipientsList: item.recipients,
      activityId: item.activityId,
      status: 'sent'
    }));

    return {
      history: formattedHistory,
      pagination: {
        current_page: parseInt(page),
        per_page: parseInt(limit),
        total,
        total_pages: Math.ceil(total / parseInt(limit))
      }
    };
  }
}

module.exports = GetSentNotificationsUseCase;

