import NotificationPrismaRepositoryModule from '../data/repositories/NotificationPrismaRepository';
import GetUserNotificationsUseCaseModule from '../business/services/GetUserNotificationsUseCase';
import GetNotificationByIdUseCaseModule from '../business/services/GetNotificationByIdUseCase';
import MarkAsReadUseCaseModule from '../business/services/MarkAsReadUseCase';
import MarkAllAsReadUseCaseModule from '../business/services/MarkAllAsReadUseCase';
import DeleteNotificationUseCaseModule from '../business/services/DeleteNotificationUseCase';
import GetUnreadCountUseCaseModule from '../business/services/GetUnreadCountUseCase';
import GetSentNotificationsUseCaseModule from '../business/services/GetSentNotificationsUseCase';
import GetSentNotificationDetailUseCaseModule from '../business/services/GetSentNotificationDetailUseCase';
import CreateNotificationUseCaseModule from '../business/services/CreateNotificationUseCase';
import SendClassApprovalRequestUseCaseModule from '../business/services/SendClassApprovalRequestUseCase';
import NotificationsControllerModule from './controllers/NotificationsController';

// Handle ES module interop with CommonJS
const NotificationPrismaRepository = (NotificationPrismaRepositoryModule as { default?: unknown }).default || NotificationPrismaRepositoryModule;
const GetUserNotificationsUseCase = (GetUserNotificationsUseCaseModule as { default?: unknown }).default || GetUserNotificationsUseCaseModule;
const GetNotificationByIdUseCase = (GetNotificationByIdUseCaseModule as { default?: unknown }).default || GetNotificationByIdUseCaseModule;
const MarkAsReadUseCase = (MarkAsReadUseCaseModule as { default?: unknown }).default || MarkAsReadUseCaseModule;
const MarkAllAsReadUseCase = (MarkAllAsReadUseCaseModule as { default?: unknown }).default || MarkAllAsReadUseCaseModule;
const DeleteNotificationUseCase = (DeleteNotificationUseCaseModule as { default?: unknown }).default || DeleteNotificationUseCaseModule;
const GetUnreadCountUseCase = (GetUnreadCountUseCaseModule as { default?: unknown }).default || GetUnreadCountUseCaseModule;
const GetSentNotificationsUseCase = (GetSentNotificationsUseCaseModule as { default?: unknown }).default || GetSentNotificationsUseCaseModule;
const GetSentNotificationDetailUseCase = (GetSentNotificationDetailUseCaseModule as { default?: unknown }).default || GetSentNotificationDetailUseCaseModule;
const CreateNotificationUseCase = (CreateNotificationUseCaseModule as { default?: unknown }).default || CreateNotificationUseCaseModule;
const SendClassApprovalRequestUseCase = (SendClassApprovalRequestUseCaseModule as { default?: unknown }).default || SendClassApprovalRequestUseCaseModule;
const NotificationsController = (NotificationsControllerModule as { default?: unknown }).default || NotificationsControllerModule;

/**
 * Factory for creating NotificationsController with all dependencies
 * Implements Dependency Injection pattern
 */
export function createNotificationsController() {
  // Data layer
  const notificationRepository = new (NotificationPrismaRepository as new () => InstanceType<typeof NotificationPrismaRepositoryModule>)();

  // Business layer (Use Cases)
  const useCases = {
    getUserNotifications: new (GetUserNotificationsUseCase as new (repo: unknown) => unknown)(notificationRepository),
    getNotificationById: new (GetNotificationByIdUseCase as new (repo: unknown) => unknown)(notificationRepository),
    markAsRead: new (MarkAsReadUseCase as new (repo: unknown) => unknown)(notificationRepository),
    markAllAsRead: new (MarkAllAsReadUseCase as new (repo: unknown) => unknown)(notificationRepository),
    deleteNotification: new (DeleteNotificationUseCase as new (repo: unknown) => unknown)(notificationRepository),
    getUnreadCount: new (GetUnreadCountUseCase as new (repo: unknown) => unknown)(notificationRepository),
    getSentNotifications: new (GetSentNotificationsUseCase as new (repo: unknown) => unknown)(notificationRepository),
    getSentNotificationDetail: new (GetSentNotificationDetailUseCase as new (repo: unknown) => unknown)(notificationRepository),
    createNotification: new (CreateNotificationUseCase as new (repo: unknown) => unknown)(notificationRepository),
    sendClassApprovalRequest: new (SendClassApprovalRequestUseCase as new (repo: unknown) => unknown)(notificationRepository)
  };

  // Presentation layer
  const controller = new (NotificationsController as new (useCases: unknown) => InstanceType<typeof NotificationsControllerModule>)(useCases);

  return controller;
}

export default { createNotificationsController };
module.exports = { createNotificationsController };
