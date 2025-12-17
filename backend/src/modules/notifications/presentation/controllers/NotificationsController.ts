import { Request, Response } from 'express';
import { ApiResponse, sendResponse } from '../../../../core/http/response/apiResponse';
import { logError, logInfo } from '../../../../core/logger';
import { AppError } from '../../../../core/errors/AppError';

interface AuthenticatedUser {
  sub?: string;
  id?: string;
  [key: string]: unknown;
}

interface AuthenticatedRequest extends Request {
  user?: AuthenticatedUser;
}

interface UseCases {
  createNotification: { execute: (body: unknown, userId: string) => Promise<{ notification?: unknown; message?: string } & Record<string, unknown>> };
  getUnreadCount: { execute: (userId: string) => Promise<unknown> };
  markAllAsRead: { execute: (userId: string) => Promise<unknown> };
  getSentNotificationDetail: { execute: (notificationId: string, userId: string) => Promise<unknown> };
  getSentNotifications: { execute: (userId: string, query: unknown) => Promise<unknown> };
  getUserNotifications: { execute: (userId: string, query: unknown) => Promise<unknown> };
  markAsRead: { execute: (notificationId: string, userId: string) => Promise<unknown> };
  getNotificationById: { execute: (notificationId: string, userId: string) => Promise<unknown> };
  deleteNotification: { execute: (notificationId: string, userId: string) => Promise<unknown> };
}

/**
 * NotificationsController
 * Presentation layer - handles HTTP requests/responses only
 * Follows Single Responsibility Principle (SRP)
 */
class NotificationsController {
  private useCases: UseCases;

  constructor(useCases: UseCases) {
    this.useCases = useCases;
  }

  async createNotification(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const userId = req.user?.sub || req.user?.id;

      if (!userId) {
        sendResponse(res, 401, ApiResponse.error('Không xác định được người dùng'));
        return;
      }

      logInfo(`Creating notification - User: ${userId}, Body: ${JSON.stringify(req.body)}`);

      const result = await this.useCases.createNotification.execute(req.body, userId);

      if (result.notification) {
        sendResponse(res, 201, ApiResponse.success(result.notification, result.message));
      } else {
        sendResponse(res, 201, ApiResponse.success(result, result.message));
      }
    } catch (error) {
      logError('Error creating notification:', error);
      if (error instanceof AppError) {
        sendResponse(res, error.statusCode, ApiResponse.error(error.message));
        return;
      }
      sendResponse(res, 400, ApiResponse.error((error as Error).message || 'Lỗi khi tạo thông báo', 400));
    }
  }

  async getUnreadCount(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const userId = req.user?.sub || req.user?.id;

      if (!userId) {
        sendResponse(res, 401, ApiResponse.error('Không xác định được người dùng'));
        return;
      }

      const result = await this.useCases.getUnreadCount.execute(userId);
      sendResponse(res, 200, ApiResponse.success(result));
    } catch (error) {
      logError('Error getting unread count:', error);
      sendResponse(res, 500, ApiResponse.error('Lỗi khi lấy số lượng thông báo chưa đọc', 500));
    }
  }

  async markAllAsRead(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const userId = req.user?.sub || req.user?.id;

      if (!userId) {
        sendResponse(res, 401, ApiResponse.error('Không xác định được người dùng'));
        return;
      }

      const result = await this.useCases.markAllAsRead.execute(userId);
      sendResponse(res, 200, ApiResponse.success(result));
    } catch (error) {
      logError('Error marking all notifications as read:', error);
      sendResponse(res, 500, ApiResponse.error('Lỗi khi đánh dấu tất cả thông báo đã đọc', 500));
    }
  }

  async getSentNotificationDetail(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const userId = req.user?.sub || req.user?.id;
      const { notificationId } = req.params;

      if (!userId) {
        sendResponse(res, 401, ApiResponse.error('Không xác định được người dùng'));
        return;
      }

      const result = await this.useCases.getSentNotificationDetail.execute(notificationId, userId);

      if (!result) {
        sendResponse(res, 404, ApiResponse.error('Không tìm thấy thông báo'));
        return;
      }

      sendResponse(res, 200, ApiResponse.success(result));
    } catch (error) {
      logError('Error getting sent notification detail:', error);
      if (error instanceof AppError) {
        sendResponse(res, error.statusCode, ApiResponse.error(error.message));
        return;
      }
      sendResponse(res, 500, ApiResponse.error('Lỗi khi lấy chi tiết thông báo đã gửi', 500));
    }
  }

  async getSentNotifications(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const userId = req.user?.sub || req.user?.id;

      if (!userId) {
        sendResponse(res, 401, ApiResponse.error('Không xác định được người dùng'));
        return;
      }

      const result = await this.useCases.getSentNotifications.execute(userId, req.query);
      sendResponse(res, 200, ApiResponse.success(result));
    } catch (error) {
      logError('Error fetching sent notifications:', error);
      sendResponse(res, 500, ApiResponse.error('Lỗi khi lấy lịch sử thông báo đã gửi', 500));
    }
  }

  async getUserNotifications(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const userId = req.user?.sub || req.user?.id;

      if (!userId) {
        sendResponse(res, 401, ApiResponse.error('Không xác định được người dùng'));
        return;
      }

      const result = await this.useCases.getUserNotifications.execute(userId, req.query);
      sendResponse(res, 200, ApiResponse.success(result));
    } catch (error) {
      logError('Error fetching notifications:', error);
      sendResponse(res, 500, ApiResponse.error('Lỗi khi lấy danh sách thông báo', 500));
    }
  }

  async markAsRead(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const userId = req.user?.sub || req.user?.id;
      const { notificationId } = req.params;

      if (!userId) {
        sendResponse(res, 401, ApiResponse.error('Không xác định được người dùng'));
        return;
      }

      const result = await this.useCases.markAsRead.execute(notificationId, userId);

      if (!result) {
        sendResponse(res, 404, ApiResponse.error('Không tìm thấy thông báo'));
        return;
      }

      sendResponse(res, 200, ApiResponse.success(result));
    } catch (error) {
      logError('Error marking notification as read:', error);
      if (error instanceof AppError) {
        sendResponse(res, error.statusCode, ApiResponse.error(error.message));
        return;
      }
      sendResponse(res, 500, ApiResponse.error('Lỗi khi đánh dấu thông báo đã đọc', 500));
    }
  }

  async getNotificationById(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const userId = req.user?.sub || req.user?.id;
      const { notificationId } = req.params;

      if (!userId) {
        sendResponse(res, 401, ApiResponse.error('Không xác định được người dùng'));
        return;
      }

      const result = await this.useCases.getNotificationById.execute(notificationId, userId);

      if (!result) {
        sendResponse(res, 404, ApiResponse.error('Không tìm thấy thông báo'));
        return;
      }

      sendResponse(res, 200, ApiResponse.success(result));
    } catch (error) {
      logError('Error getting notification detail:', error);
      if (error instanceof AppError) {
        sendResponse(res, error.statusCode, ApiResponse.error(error.message));
        return;
      }
      sendResponse(res, 500, ApiResponse.error('Lỗi khi lấy chi tiết thông báo', 500));
    }
  }

  async deleteNotification(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const userId = req.user?.sub || req.user?.id;
      const { notificationId } = req.params;

      if (!userId) {
        sendResponse(res, 401, ApiResponse.error('Không xác định được người dùng'));
        return;
      }

      const result = await this.useCases.deleteNotification.execute(notificationId, userId);

      if (!result) {
        sendResponse(res, 404, ApiResponse.error('Không tìm thấy thông báo'));
        return;
      }

      sendResponse(res, 200, ApiResponse.success(result));
    } catch (error) {
      logError('Error deleting notification:', error);
      if (error instanceof AppError) {
        sendResponse(res, error.statusCode, ApiResponse.error(error.message));
        return;
      }
      sendResponse(res, 500, ApiResponse.error('Lỗi khi xóa thông báo', 500));
    }
  }
}

export default NotificationsController;
module.exports = NotificationsController;
