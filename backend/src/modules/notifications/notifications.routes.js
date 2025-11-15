/**
 * Notifications Routes (V2)
 * RESTful endpoints for notification operations
 */

const express = require('express');
const router = express.Router();
const service = require('./notifications.service');
const { ApiResponse, sendResponse } = require('../../core/http/response/apiResponse');
const { logError, logInfo } = require('../../core/logger');
const { auth: authenticateJWT } = require('../../core/http/middleware/authJwt');

// Apply authentication to all routes
router.use(authenticateJWT);

/**
 * POST /api/core/notifications
 * Create new notification
 * Supports: single recipient, class broadcast, activity broadcast
 */
router.post('/', async (req, res) => {
  try {
    const userId = req.user?.sub || req.user?.id;
    
    if (!userId) {
      return sendResponse(res, 401, ApiResponse.error('Không xác định được người dùng'));
    }

    logInfo(`Creating notification - User: ${userId}, Body: ${JSON.stringify(req.body)}`);

    const result = await service.createNotification(req.body, userId);
    
    // Handle different return formats
    if (result.notification) {
      return sendResponse(res, 201, ApiResponse.success(result.notification, result.message));
    } else {
      return sendResponse(res, 201, ApiResponse.success(result, result.message));
    }
  } catch (error) {
    logError('Error creating notification:', error);
    return sendResponse(res, 400, ApiResponse.error(error.message || 'Lỗi khi tạo thông báo', 400));
  }
});

/**
 * GET /api/core/notifications/unread-count
 * Get count of unread notifications
 */
router.get('/unread-count', async (req, res) => {
  try {
    const userId = req.user?.sub || req.user?.id;
    
    if (!userId) {
      return sendResponse(res, 401, ApiResponse.error('Không xác định được người dùng'));
    }

    const result = await service.getUnreadCount(userId);
    return sendResponse(res, 200, ApiResponse.success(result));
  } catch (error) {
    logError('Error getting unread count:', error);
    return sendResponse(res, 500, ApiResponse.error('Lỗi khi lấy số lượng thông báo chưa đọc', 500));
  }
});

/**
 * PATCH /api/core/notifications/mark-all-read
 * Mark all notifications as read
 */
router.patch('/mark-all-read', async (req, res) => {
  try {
    const userId = req.user?.sub || req.user?.id;
    
    if (!userId) {
      return sendResponse(res, 401, ApiResponse.error('Không xác định được người dùng'));
    }

    const result = await service.markAllAsRead(userId);
    return sendResponse(res, 200, ApiResponse.success(result));
  } catch (error) {
    logError('Error marking all notifications as read:', error);
    return sendResponse(res, 500, ApiResponse.error('Lỗi khi đánh dấu tất cả thông báo đã đọc', 500));
  }
});

/**
 * GET /api/core/notifications/sent/:notificationId
 * Get sent notification detail
 */
router.get('/sent/:notificationId', async (req, res) => {
  try {
    const userId = req.user?.sub || req.user?.id;
    const { notificationId } = req.params;
    
    if (!userId) {
      return sendResponse(res, 401, ApiResponse.error('Không xác định được người dùng'));
    }

    const result = await service.getSentNotificationDetail(notificationId, userId);
    
    if (!result) {
      return sendResponse(res, 404, ApiResponse.error('Không tìm thấy thông báo'));
    }

    return sendResponse(res, 200, ApiResponse.success(result));
  } catch (error) {
    logError('Error getting sent notification detail:', error);
    return sendResponse(res, 500, ApiResponse.error('Lỗi khi lấy chi tiết thông báo đã gửi', 500));
  }
});

/**
 * GET /api/core/notifications/sent
 * Get sent notifications history
 */
router.get('/sent', async (req, res) => {
  try {
    const userId = req.user?.sub || req.user?.id;
    
    if (!userId) {
      return sendResponse(res, 401, ApiResponse.error('Không xác định được người dùng'));
    }

    const result = await service.getSentNotifications(userId, req.query);
    return sendResponse(res, 200, ApiResponse.success(result));
  } catch (error) {
    logError('Error fetching sent notifications:', error);
    return sendResponse(res, 500, ApiResponse.error('Lỗi khi lấy lịch sử thông báo đã gửi', 500));
  }
});

/**
 * GET /api/core/notifications
 * Get user's received notifications
 */
router.get('/', async (req, res) => {
  try {
    const userId = req.user?.sub || req.user?.id;
    
    if (!userId) {
      return sendResponse(res, 401, ApiResponse.error('Không xác định được người dùng'));
    }

    const result = await service.getUserNotifications(userId, req.query);
    return sendResponse(res, 200, ApiResponse.success(result));
  } catch (error) {
    logError('Error fetching notifications:', error);
    return sendResponse(res, 500, ApiResponse.error('Lỗi khi lấy danh sách thông báo', 500));
  }
});

/**
 * PATCH /api/core/notifications/:notificationId/read
 * Mark notification as read
 */
router.patch('/:notificationId/read', async (req, res) => {
  try {
    const userId = req.user?.sub || req.user?.id;
    const { notificationId } = req.params;
    
    if (!userId) {
      return sendResponse(res, 401, ApiResponse.error('Không xác định được người dùng'));
    }

    const result = await service.markAsRead(notificationId, userId);
    
    if (!result) {
      return sendResponse(res, 404, ApiResponse.error('Không tìm thấy thông báo'));
    }

    return sendResponse(res, 200, ApiResponse.success(result));
  } catch (error) {
    logError('Error marking notification as read:', error);
    return sendResponse(res, 500, ApiResponse.error('Lỗi khi đánh dấu thông báo đã đọc', 500));
  }
});

/**
 * GET /api/core/notifications/:notificationId
 * Get notification detail by ID
 */
router.get('/:notificationId', async (req, res) => {
  try {
    const userId = req.user?.sub || req.user?.id;
    const { notificationId } = req.params;
    
    if (!userId) {
      return sendResponse(res, 401, ApiResponse.error('Không xác định được người dùng'));
    }

    const result = await service.getNotificationById(notificationId, userId);
    
    if (!result) {
      return sendResponse(res, 404, ApiResponse.error('Không tìm thấy thông báo'));
    }

    return sendResponse(res, 200, ApiResponse.success(result));
  } catch (error) {
    logError('Error getting notification detail:', error);
    return sendResponse(res, 500, ApiResponse.error('Lỗi khi lấy chi tiết thông báo', 500));
  }
});

/**
 * DELETE /api/core/notifications/:notificationId
 * Delete notification
 */
router.delete('/:notificationId', async (req, res) => {
  try {
    const userId = req.user?.sub || req.user?.id;
    const { notificationId } = req.params;
    
    if (!userId) {
      return sendResponse(res, 401, ApiResponse.error('Không xác định được người dùng'));
    }

    const result = await service.deleteNotification(notificationId, userId);
    
    if (!result) {
      return sendResponse(res, 404, ApiResponse.error('Không tìm thấy thông báo'));
    }

    return sendResponse(res, 200, ApiResponse.success(result));
  } catch (error) {
    logError('Error deleting notification:', error);
    return sendResponse(res, 500, ApiResponse.error('Lỗi khi xóa thông báo', 500));
  }
});

module.exports = router;





