const NotificationTypePrismaRepository = require('../infrastructure/repositories/NotificationTypePrismaRepository');
const ListNotificationTypesUseCase = require('../application/use-cases/ListNotificationTypesUseCase');
const GetNotificationTypeByIdUseCase = require('../application/use-cases/GetNotificationTypeByIdUseCase');
const CreateNotificationTypeUseCase = require('../application/use-cases/CreateNotificationTypeUseCase');
const UpdateNotificationTypeUseCase = require('../application/use-cases/UpdateNotificationTypeUseCase');
const DeleteNotificationTypeUseCase = require('../application/use-cases/DeleteNotificationTypeUseCase');
const NotificationTypesController = require('./NotificationTypesController');

/**
 * Factory for creating NotificationTypesController with all dependencies
 * Implements Dependency Injection pattern
 */
function createNotificationTypesController() {
  // Infrastructure layer
  const notificationTypeRepository = new NotificationTypePrismaRepository();

  // Application layer (Use Cases)
  const useCases = {
    list: new ListNotificationTypesUseCase(notificationTypeRepository),
    getById: new GetNotificationTypeByIdUseCase(notificationTypeRepository),
    create: new CreateNotificationTypeUseCase(notificationTypeRepository),
    update: new UpdateNotificationTypeUseCase(notificationTypeRepository),
    delete: new DeleteNotificationTypeUseCase(notificationTypeRepository)
  };

  // Presentation layer
  const controller = new NotificationTypesController(useCases);

  return controller;
}

module.exports = { createNotificationTypesController };

