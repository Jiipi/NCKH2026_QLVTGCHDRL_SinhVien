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

import routes from './presentation/routes/notifications.routes';
export { routes };
module.exports = { routes };
