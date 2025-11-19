/**
 * Notifications Routes (V2)
 * RESTful endpoints for notification operations
 */

const express = require('express');
const router = express.Router();
const { createNotificationsController } = require('./presentation/notifications.factory');
const { auth: authenticateJWT, requireDynamicPermission } = require('../../core/http/middleware');

const notificationsController = createNotificationsController();

// Apply authentication to all routes
router.use(authenticateJWT);

/**
 * POST /api/core/notifications
 * Create new notification
 * Supports: single recipient, class broadcast, activity broadcast
 * Requires: notifications.write permission
 */
router.post('/', requireDynamicPermission('notifications.write'), (req, res) => notificationsController.createNotification(req, res));

/**
 * GET /api/core/notifications/unread-count
 * Get count of unread notifications
 * Requires: notifications.read permission
 */
router.get('/unread-count', requireDynamicPermission('notifications.read'), (req, res) => notificationsController.getUnreadCount(req, res));

/**
 * PATCH /api/core/notifications/mark-all-read
 * Mark all notifications as read
 * Requires: notifications.read permission
 */
router.patch('/mark-all-read', requireDynamicPermission('notifications.read'), (req, res) => notificationsController.markAllAsRead(req, res));

/**
 * GET /api/core/notifications/sent/:notificationId
 * Get sent notification detail
 * Requires: notifications.read permission
 */
router.get('/sent/:notificationId', requireDynamicPermission('notifications.read'), (req, res) => notificationsController.getSentNotificationDetail(req, res));

/**
 * GET /api/core/notifications/sent
 * Get sent notifications history
 * Requires: notifications.read permission
 */
router.get('/sent', requireDynamicPermission('notifications.read'), (req, res) => notificationsController.getSentNotifications(req, res));

/**
 * GET /api/core/notifications
 * Get user's received notifications
 * Requires: notifications.read permission
 */
router.get('/', requireDynamicPermission('notifications.read'), (req, res) => notificationsController.getUserNotifications(req, res));

/**
 * PATCH /api/core/notifications/:notificationId/read
 * Mark notification as read
 */
router.patch('/:notificationId/read', (req, res) => notificationsController.markAsRead(req, res));

/**
 * GET /api/core/notifications/:notificationId
 * Get notification detail by ID
 * Requires: notifications.read permission
 */
router.get('/:notificationId', requireDynamicPermission('notifications.read'), (req, res) => notificationsController.getNotificationById(req, res));

/**
 * DELETE /api/core/notifications/:notificationId
 * Delete notification
 * Requires: notifications.delete permission
 */
router.delete('/:notificationId', requireDynamicPermission('notifications.delete'), (req, res) => notificationsController.deleteNotification(req, res));

module.exports = router;





