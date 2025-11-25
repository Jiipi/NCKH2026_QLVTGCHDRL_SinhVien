const NotificationPrismaRepository = require('../data/repositories/NotificationPrismaRepository');
const GetUserNotificationsUseCase = require('../business/services/GetUserNotificationsUseCase');
const GetNotificationByIdUseCase = require('../business/services/GetNotificationByIdUseCase');
const MarkAsReadUseCase = require('../business/services/MarkAsReadUseCase');
const MarkAllAsReadUseCase = require('../business/services/MarkAllAsReadUseCase');
const DeleteNotificationUseCase = require('../business/services/DeleteNotificationUseCase');
const GetUnreadCountUseCase = require('../business/services/GetUnreadCountUseCase');
const GetSentNotificationsUseCase = require('../business/services/GetSentNotificationsUseCase');
const GetSentNotificationDetailUseCase = require('../business/services/GetSentNotificationDetailUseCase');
const CreateNotificationUseCase = require('../business/services/CreateNotificationUseCase');
const SendClassApprovalRequestUseCase = require('../business/services/SendClassApprovalRequestUseCase');
const NotificationsController = require('./controllers/NotificationsController');

/**
 * Factory for creating NotificationsController with all dependencies
 * Implements Dependency Injection pattern
 */
function createNotificationsController() {
  // Data layer
  const notificationRepository = new NotificationPrismaRepository();

  // Business layer (Use Cases)
  const useCases = {
    getUserNotifications: new GetUserNotificationsUseCase(notificationRepository),
    getNotificationById: new GetNotificationByIdUseCase(notificationRepository),
    markAsRead: new MarkAsReadUseCase(notificationRepository),
    markAllAsRead: new MarkAllAsReadUseCase(notificationRepository),
    deleteNotification: new DeleteNotificationUseCase(notificationRepository),
    getUnreadCount: new GetUnreadCountUseCase(notificationRepository),
    getSentNotifications: new GetSentNotificationsUseCase(notificationRepository),
    getSentNotificationDetail: new GetSentNotificationDetailUseCase(notificationRepository),
    createNotification: new CreateNotificationUseCase(notificationRepository),
    sendClassApprovalRequest: new SendClassApprovalRequestUseCase(notificationRepository)
  };

  // Presentation layer
  const controller = new NotificationsController(useCases);

  return controller;
}

module.exports = { createNotificationsController };

