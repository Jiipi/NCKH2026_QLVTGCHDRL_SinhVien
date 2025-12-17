/**
 * Notifications Module - TypeScript Index
 */

export type {
  Notification,
  NotificationWithRelations,
  NotificationFilterOptions,
  NotificationPaginationOptions,
  CreateNotificationDto,
  NotificationDto,
  PaginatedNotificationsResult,
  UnreadCountResult,
  INotificationRepository,
  IGetNotificationsUseCase,
  ICreateNotificationUseCase,
  IMarkAsReadUseCase,
  INotificationsController
} from './notifications.types';

const routes = require('./presentation/routes/notifications.routes');
export { routes };
module.exports = { routes };
