/**
 * Notification Types Module - TypeScript Index
 * Runtime entry point for CommonJS require()
 */
import routes from './presentation/routes/notification-types.routes';

// Re-export types from interfaces
export type {
  NotificationTypeOrderBy,
  NotificationTypeWithCount,
  CreateNotificationTypeData,
  UpdateNotificationTypeData
} from './business/interfaces/INotificationTypeRepository';

export type { CreateNotificationTypeInput } from './business/dto/CreateNotificationTypeDto';
export type { AuthenticatedRequest, NotificationTypeUseCases } from './presentation/controllers/NotificationTypesController';

export { routes };
module.exports = { routes };
