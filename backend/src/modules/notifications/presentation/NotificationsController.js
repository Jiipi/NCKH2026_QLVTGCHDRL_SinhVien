const { ApiResponse, sendResponse } = require('../../../core/http/response/apiResponse');
const { logError, logInfo } = require('../../../core/logger');
const { AppError } = require('../../../core/errors/AppError');

/**
 * NotificationsController
 * Presentation layer - handles HTTP requests/responses only
 * Follows Single Responsibility Principle (SRP)
 */
class NotificationsController {
  constructor(useCases) {
    this.useCases = useCases;
  }

  async createNotification(req, res) {
    try {
      const userId = req.user?.sub || req.user?.id;
      
      if (!userId) {
        return sendResponse(res, 401, ApiResponse.error('Không xác định được người dùng'));
      }

      logInfo(`Creating notification - User: ${userId}, Body: ${JSON.stringify(req.body)}`);

      const result = await this.useCases.createNotification.execute(req.body, userId);
      
      if (result.notification) {
        return sendResponse(res, 201, ApiResponse.success(result.notification, result.message));
      } else {
        return sendResponse(res, 201, ApiResponse.success(result, result.message));
      }
    } catch (error) {
      logError('Error creating notification:', error);
      if (error instanceof AppError) {
        return sendResponse(res, error.statusCode, ApiResponse.error(error.message));
      }
      return sendResponse(res, 400, ApiResponse.error(error.message || 'Lỗi khi tạo thông báo', 400));
    }
  }

  async getUnreadCount(req, res) {
    try {
      const userId = req.user?.sub || req.user?.id;
      
      if (!userId) {
        return sendResponse(res, 401, ApiResponse.error('Không xác định được người dùng'));
      }

      const result = await this.useCases.getUnreadCount.execute(userId);
      return sendResponse(res, 200, ApiResponse.success(result));
    } catch (error) {
      logError('Error getting unread count:', error);
      return sendResponse(res, 500, ApiResponse.error('Lỗi khi lấy số lượng thông báo chưa đọc', 500));
    }
  }

  async markAllAsRead(req, res) {
    try {
      const userId = req.user?.sub || req.user?.id;
      
      if (!userId) {
        return sendResponse(res, 401, ApiResponse.error('Không xác định được người dùng'));
      }

      const result = await this.useCases.markAllAsRead.execute(userId);
      return sendResponse(res, 200, ApiResponse.success(result));
    } catch (error) {
      logError('Error marking all notifications as read:', error);
      return sendResponse(res, 500, ApiResponse.error('Lỗi khi đánh dấu tất cả thông báo đã đọc', 500));
    }
  }

  async getSentNotificationDetail(req, res) {
    try {
      const userId = req.user?.sub || req.user?.id;
      const { notificationId } = req.params;
      
      if (!userId) {
        return sendResponse(res, 401, ApiResponse.error('Không xác định được người dùng'));
      }

      const result = await this.useCases.getSentNotificationDetail.execute(notificationId, userId);
      
      if (!result) {
        return sendResponse(res, 404, ApiResponse.error('Không tìm thấy thông báo'));
      }

      return sendResponse(res, 200, ApiResponse.success(result));
    } catch (error) {
      logError('Error getting sent notification detail:', error);
      if (error instanceof AppError) {
        return sendResponse(res, error.statusCode, ApiResponse.error(error.message));
      }
      return sendResponse(res, 500, ApiResponse.error('Lỗi khi lấy chi tiết thông báo đã gửi', 500));
    }
  }

  async getSentNotifications(req, res) {
    try {
      const userId = req.user?.sub || req.user?.id;
      
      if (!userId) {
        return sendResponse(res, 401, ApiResponse.error('Không xác định được người dùng'));
      }

      const result = await this.useCases.getSentNotifications.execute(userId, req.query);
      return sendResponse(res, 200, ApiResponse.success(result));
    } catch (error) {
      logError('Error fetching sent notifications:', error);
      return sendResponse(res, 500, ApiResponse.error('Lỗi khi lấy lịch sử thông báo đã gửi', 500));
    }
  }

  async getUserNotifications(req, res) {
    try {
      const userId = req.user?.sub || req.user?.id;
      
      if (!userId) {
        return sendResponse(res, 401, ApiResponse.error('Không xác định được người dùng'));
      }

      const result = await this.useCases.getUserNotifications.execute(userId, req.query);
      return sendResponse(res, 200, ApiResponse.success(result));
    } catch (error) {
      logError('Error fetching notifications:', error);
      return sendResponse(res, 500, ApiResponse.error('Lỗi khi lấy danh sách thông báo', 500));
    }
  }

  async markAsRead(req, res) {
    try {
      const userId = req.user?.sub || req.user?.id;
      const { notificationId } = req.params;
      
      if (!userId) {
        return sendResponse(res, 401, ApiResponse.error('Không xác định được người dùng'));
      }

      const result = await this.useCases.markAsRead.execute(notificationId, userId);
      
      if (!result) {
        return sendResponse(res, 404, ApiResponse.error('Không tìm thấy thông báo'));
      }

      return sendResponse(res, 200, ApiResponse.success(result));
    } catch (error) {
      logError('Error marking notification as read:', error);
      if (error instanceof AppError) {
        return sendResponse(res, error.statusCode, ApiResponse.error(error.message));
      }
      return sendResponse(res, 500, ApiResponse.error('Lỗi khi đánh dấu thông báo đã đọc', 500));
    }
  }

  async getNotificationById(req, res) {
    try {
      const userId = req.user?.sub || req.user?.id;
      const { notificationId } = req.params;
      
      if (!userId) {
        return sendResponse(res, 401, ApiResponse.error('Không xác định được người dùng'));
      }

      const result = await this.useCases.getNotificationById.execute(notificationId, userId);
      
      if (!result) {
        return sendResponse(res, 404, ApiResponse.error('Không tìm thấy thông báo'));
      }

      return sendResponse(res, 200, ApiResponse.success(result));
    } catch (error) {
      logError('Error getting notification detail:', error);
      if (error instanceof AppError) {
        return sendResponse(res, error.statusCode, ApiResponse.error(error.message));
      }
      return sendResponse(res, 500, ApiResponse.error('Lỗi khi lấy chi tiết thông báo', 500));
    }
  }

  async deleteNotification(req, res) {
    try {
      const userId = req.user?.sub || req.user?.id;
      const { notificationId } = req.params;
      
      if (!userId) {
        return sendResponse(res, 401, ApiResponse.error('Không xác định được người dùng'));
      }

      const result = await this.useCases.deleteNotification.execute(notificationId, userId);
      
      if (!result) {
        return sendResponse(res, 404, ApiResponse.error('Không tìm thấy thông báo'));
      }

      return sendResponse(res, 200, ApiResponse.success(result));
    } catch (error) {
      logError('Error deleting notification:', error);
      if (error instanceof AppError) {
        return sendResponse(res, error.statusCode, ApiResponse.error(error.message));
      }
      return sendResponse(res, 500, ApiResponse.error('Lỗi khi xóa thông báo', 500));
    }
  }
}

module.exports = NotificationsController;

