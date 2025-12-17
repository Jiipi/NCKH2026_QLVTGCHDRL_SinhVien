import notificationTypesRepository from '../data/repositories/notification-types.repository';
import ListNotificationTypesUseCase from '../business/services/ListNotificationTypesUseCase';
import GetNotificationTypeByIdUseCase from '../business/services/GetNotificationTypeByIdUseCase';
import CreateNotificationTypeUseCase from '../business/services/CreateNotificationTypeUseCase';
import UpdateNotificationTypeUseCase from '../business/services/UpdateNotificationTypeUseCase';
import DeleteNotificationTypeUseCase from '../business/services/DeleteNotificationTypeUseCase';
import NotificationTypesController from './controllers/NotificationTypesController';
import type { NotificationTypeUseCases } from './controllers/NotificationTypesController';

/**
 * Factory for creating NotificationTypesController with all dependencies
 * Implements Dependency Injection pattern
 */
function createNotificationTypesController(): NotificationTypesController {
  // Data layer
  const repo = notificationTypesRepository;

  // Business layer (Use Cases)
  const useCases: NotificationTypeUseCases = {
    list: new ListNotificationTypesUseCase(repo),
    getById: new GetNotificationTypeByIdUseCase(repo),
    create: new CreateNotificationTypeUseCase(repo),
    update: new UpdateNotificationTypeUseCase(repo),
    delete: new DeleteNotificationTypeUseCase(repo)
  };

  // Presentation layer
  const controller = new NotificationTypesController(useCases);

  return controller;
}

export { createNotificationTypesController };
module.exports = { createNotificationTypesController };
