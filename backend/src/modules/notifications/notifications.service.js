/**
 * Notifications Service
 * Business logic for notification operations
 */

const repo = require('./notifications.repo');
const { logError, logInfo } = require('../../utils/logger');

class NotificationsService {
  /**
   * Get user's received notifications with pagination
   */
  async getUserNotifications(userId, query) {
    const { page = 1, limit = 20, unread_only = false } = query;

    const filters = {
      nguoi_nhan_id: userId,
      unread_only
    };

    const { notifications, total } = await repo.findNotifications(filters, { page, limit });
    const unreadCount = await repo.countUnread(userId);

    // Format notifications
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

  /**
   * Get notification detail by ID
   */
  async getNotificationById(notificationId, userId) {
    const notification = await repo.findByIdForUser(notificationId, userId, 'received');

    if (!notification) {
      return null;
    }

    // Try to extract activity info from message
    let activity = null;
    try {
      const hdIdMatch = (notification.noi_dung || '').match(/hd_id\s*:\s*([0-9a-fA-F-]{36})/);
      const maHdMatch = (notification.noi_dung || '').match(/ma_hd\s*:\s*([A-Za-z0-9_-]{4,})/);

      if (hdIdMatch) {
        activity = await repo.findActivity({ id: hdIdMatch[1] });
      } else if (maHdMatch) {
        activity = await repo.findActivity({ ma_hd: maHdMatch[1] });
      }
    } catch (error) {
      logError('Error extracting activity from notification:', error);
    }

    return {
      id: notification.id,
      title: notification.tieu_de,
      message: notification.noi_dung,
      type: notification.loai_tb.ten_loai_tb.toLowerCase(),
      priority: notification.muc_do_uu_tien,
      unread: !notification.da_doc,
      time: notification.ngay_gui,
      sender: notification.nguoi_gui.ho_ten || notification.nguoi_gui.email,
      activity
    };
  }

  /**
   * Mark notification as read
   */
  async markAsRead(notificationId, userId) {
    const notification = await repo.findByIdForUser(notificationId, userId, 'received');

    if (!notification) {
      return null;
    }

    await repo.markAsRead(notificationId);
    return { message: 'Đã đánh dấu thông báo đã đọc' };
  }

  /**
   * Mark all notifications as read
   */
  async markAllAsRead(userId) {
    await repo.markAllAsRead(userId);
    return { message: 'Đã đánh dấu tất cả thông báo đã đọc' };
  }

  /**
   * Delete notification
   */
  async deleteNotification(notificationId, userId) {
    const notification = await repo.findByIdForUser(notificationId, userId, 'received');

    if (!notification) {
      return null;
    }

    await repo.delete(notificationId);
    return { message: 'Đã xóa thông báo' };
  }

  /**
   * Get unread count
   */
  async getUnreadCount(userId) {
    const unreadCount = await repo.countUnread(userId);
    return { unread_count: unreadCount };
  }

  /**
   * Get sent notifications history
   */
  async getSentNotifications(userId, query) {
    const { page = 1, limit = 20 } = query;

    const filters = {
      nguoi_gui_id: userId
    };

    const { notifications, total } = await repo.findNotifications(filters, { page, limit });

    // Group notifications by title and date
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

        // Extract scope and activity info
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

  /**
   * Get sent notification detail
   */
  async getSentNotificationDetail(notificationId, userId) {
    const notification = await repo.findByIdForUser(notificationId, userId, 'sent');

    if (!notification) {
      return null;
    }

    // Get all notifications in the same batch
    const allNotifications = await repo.findSentNotificationsBatch(
      userId,
      notification.tieu_de,
      notification.ngay_gui
    );

    // Extract activity and scope info
    let activity = null;
    let scope = 'class';

    try {
      const activityMatch = notification.noi_dung.match(/hd_id\s*:\s*([0-9a-fA-F-]{36})/);
      const scopeMatch = notification.noi_dung.match(/phạm vi:\s*(class|activity|single)/i);

      if (scopeMatch) {
        scope = scopeMatch[1].toLowerCase();
      }

      if (activityMatch) {
        activity = await repo.findActivity({ id: activityMatch[1] });
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

  /**
   * Create notification
   */
  async createNotification(data, userId) {
    const {
      tieu_de,
      noi_dung,
      loai_tb_id,
      nguoi_nhan_id,
      muc_do_uu_tien = 'trung_binh',
      phuong_thuc_gui = 'trong_he_thong',
      scope,
      activityId,
      hd_id
    } = data;

    // Validate required fields
    if (!tieu_de || !noi_dung) {
      throw new Error('Thiếu thông tin bắt buộc');
    }

    if (!userId) {
      throw new Error('Không xác định được người gửi');
    }

    // Normalize enum values
    const PRIORITY_MAP = {
      binh_thuong: 'trung_binh',
      trung_binh: 'trung_binh',
      thap: 'thap',
      cao: 'cao',
      khan_cap: 'khan_cap'
    };
    const METHOD_MAP = {
      trong_he_thong: 'trong_he_thong',
      email: 'email',
      sdt: 'sdt'
    };

    const normalizedPriority = PRIORITY_MAP[String(muc_do_uu_tien || '').toLowerCase()] || 'trung_binh';
    const normalizedMethod = METHOD_MAP[String(phuong_thuc_gui || '').toLowerCase()] || 'trong_he_thong';

    // Get or create notification type
    const loaiThongBao = await repo.getOrCreateNotificationType(loai_tb_id);

    // Handle broadcast to class
    if (String(scope || '').toLowerCase() === 'class') {
      return await this._createClassNotification(
        userId,
        tieu_de,
        noi_dung,
        loaiThongBao.id,
        normalizedPriority,
        normalizedMethod
      );
    }

    // Handle broadcast to activity participants
    if (String(scope || '').toLowerCase() === 'activity') {
      const targetHdId = activityId || hd_id;
      if (!targetHdId) {
        throw new Error('Thiếu ID hoạt động để gửi');
      }

      return await this._createActivityNotification(
        userId,
        targetHdId,
        tieu_de,
        noi_dung,
        loaiThongBao.id,
        normalizedPriority,
        normalizedMethod
      );
    }

    // Handle single recipient
    if (!nguoi_nhan_id) {
      throw new Error('Thiếu người nhận');
    }

    const enhancedMessage = `${noi_dung}\n\n[Phạm vi: single]`;

    const notification = await repo.create({
      tieu_de,
      noi_dung: enhancedMessage,
      loai_tb_id: loaiThongBao.id,
      nguoi_gui_id: userId,
      nguoi_nhan_id,
      muc_do_uu_tien: normalizedPriority,
      phuong_thuc_gui: normalizedMethod
    });

    return { notification, message: 'Tạo thông báo thành công' };
  }

  /**
   * Create notification to class members
   */
  async _createClassNotification(userId, title, message, loaiTbId, priority, method) {
    // Try student class first
    let classIds = await repo.getStudentClassIds(userId);

    // If not student, try teacher classes
    if (classIds.length === 0) {
      classIds = await repo.getTeacherClassIds(userId);
    }

    if (classIds.length === 0) {
      throw new Error('Không xác định được lớp để gửi thông báo');
    }

    const recipientIds = await repo.getStudentsByClassIds(classIds);

    if (recipientIds.length === 0) {
      return { count: 0, message: 'Không có người nhận trong lớp' };
    }

    const enhancedMessage = `${message}\n\n[Phạm vi: class]`;

    const dataRows = recipientIds.map(rid => ({
      tieu_de: title,
      noi_dung: enhancedMessage,
      loai_tb_id: loaiTbId,
      nguoi_gui_id: userId,
      nguoi_nhan_id: rid,
      muc_do_uu_tien: priority,
      phuong_thuc_gui: method
    }));

    const result = await repo.createMany(dataRows);

    return {
      count: result.count,
      scope: 'class',
      message: 'Đã gửi thông báo tới lớp'
    };
  }

  /**
   * Create notification to activity participants
   */
  async _createActivityNotification(userId, activityId, title, message, loaiTbId, priority, method) {
    const activity = await repo.findActivity({ id: activityId });
    const recipientIds = await repo.getActivityParticipants(activityId);

    if (recipientIds.length === 0) {
      return { count: 0, message: 'Không có người nhận theo hoạt động' };
    }

    const enhancedMessage = `${message}\n\n[Phạm vi: activity | hd_id: ${activityId}${activity ? ' | ' + activity.ten_hd : ''}]`;

    const dataRows = recipientIds.map(rid => ({
      tieu_de: title,
      noi_dung: enhancedMessage,
      loai_tb_id: loaiTbId,
      nguoi_gui_id: userId,
      nguoi_nhan_id: rid,
      muc_do_uu_tien: priority,
      phuong_thuc_gui: method
    }));

    const result = await repo.createMany(dataRows);

    return {
      count: result.count,
      scope: 'activity',
      activityId,
      activityName: activity?.ten_hd,
      message: 'Đã gửi thông báo theo hoạt động'
    };
  }
}

module.exports = new NotificationsService();
