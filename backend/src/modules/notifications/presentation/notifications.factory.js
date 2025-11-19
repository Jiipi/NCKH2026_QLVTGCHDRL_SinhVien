const NotificationPrismaRepository = require('../infrastructure/repositories/NotificationPrismaRepository');
const GetUserNotificationsUseCase = require('../application/use-cases/GetUserNotificationsUseCase');
const GetNotificationByIdUseCase = require('../application/use-cases/GetNotificationByIdUseCase');
const MarkAsReadUseCase = require('../application/use-cases/MarkAsReadUseCase');
const MarkAllAsReadUseCase = require('../application/use-cases/MarkAllAsReadUseCase');
const DeleteNotificationUseCase = require('../application/use-cases/DeleteNotificationUseCase');
const GetUnreadCountUseCase = require('../application/use-cases/GetUnreadCountUseCase');
const GetSentNotificationsUseCase = require('../application/use-cases/GetSentNotificationsUseCase');
const GetSentNotificationDetailUseCase = require('../application/use-cases/GetSentNotificationDetailUseCase');
const CreateNotificationUseCase = require('../application/use-cases/CreateNotificationUseCase');
const SendClassApprovalRequestUseCase = require('../application/use-cases/SendClassApprovalRequestUseCase');
const NotificationsController = require('./NotificationsController');

/**
 * Factory for creating NotificationsController with all dependencies
 * Implements Dependency Injection pattern
 */
function createNotificationsController() {
  // Infrastructure layer
  const notificationRepository = new NotificationPrismaRepository();

  // Application layer (Use Cases)
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

