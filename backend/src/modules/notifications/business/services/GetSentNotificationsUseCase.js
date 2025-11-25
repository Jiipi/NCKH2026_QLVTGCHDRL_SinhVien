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

    // Get ALL notifications first (no pagination) to group properly
    // Then paginate the grouped results
    const { notifications } = await this.notificationRepository.findNotifications(filters, { page: 1, limit: 10000 });

    // Group notifications by unique batches
    // Each batch is identified by: title + exact timestamp (to second) + scope
    // This ensures different notifications sent at different times are not grouped together
    const groupedNotifications = {};
    for (const notif of notifications) {
      // Use exact timestamp to distinguish different notification batches
      const timestamp = notif.ngay_gui.getTime(); // Milliseconds since epoch
      const scopeMatch = notif.noi_dung.match(/phạm vi:\s*(class|activity|single)/i);
      const scope = scopeMatch ? scopeMatch[1].toLowerCase() : 'class';
      
      // Key includes title, exact timestamp, and scope
      // This ensures only notifications from the same batch (same title, same timestamp, same scope) are grouped
      const key = `${notif.tieu_de}_${timestamp}_${scope}`;

      if (!groupedNotifications[key]) {
        const activityMatch = notif.noi_dung.match(/hd_id\s*:\s*([0-9a-fA-F-]{36})/);
        
        groupedNotifications[key] = {
          id: notif.id,
          title: notif.tieu_de,
          message: notif.noi_dung,
          date: notif.ngay_gui,
          recipients: [],
          scope: scope,
          activityId: activityMatch ? activityMatch[1] : null
        };
      }

      groupedNotifications[key].recipients.push(notif.nguoi_nhan);
    }

    // Convert to array and sort by date (newest first)
    const allGrouped = Object.values(groupedNotifications).map(item => ({
      id: item.id,
      title: item.title,
      message: item.message,
      scope: item.scope || 'class',
      date: item.date,
      recipients: item.recipients.length,
      recipientsList: item.recipients,
      activityId: item.activityId,
      status: 'sent'
    })).sort((a, b) => new Date(b.date) - new Date(a.date));

    // Apply pagination to grouped results
    const total = allGrouped.length;
    const startIndex = (parseInt(page) - 1) * parseInt(limit);
    const endIndex = startIndex + parseInt(limit);
    const paginatedHistory = allGrouped.slice(startIndex, endIndex);

    // Calculate stats from all notifications (not just paginated)
    const stats = await this.notificationRepository.getSentStats(userId);

    return {
      history: paginatedHistory,
      stats,
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

