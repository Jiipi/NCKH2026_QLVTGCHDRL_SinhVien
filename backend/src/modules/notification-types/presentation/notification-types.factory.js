const notificationTypesRepository = require('../data/repositories/notification-types.repository');
const ListNotificationTypesUseCase = require('../business/services/ListNotificationTypesUseCase');
const GetNotificationTypeByIdUseCase = require('../business/services/GetNotificationTypeByIdUseCase');
const CreateNotificationTypeUseCase = require('../business/services/CreateNotificationTypeUseCase');
const UpdateNotificationTypeUseCase = require('../business/services/UpdateNotificationTypeUseCase');
const DeleteNotificationTypeUseCase = require('../business/services/DeleteNotificationTypeUseCase');
const NotificationTypesController = require('./controllers/NotificationTypesController');

/**
 * Factory for creating NotificationTypesController with all dependencies
 * Implements Dependency Injection pattern
 */
function createNotificationTypesController() {
  // Data layer
  const repo = notificationTypesRepository;

  // Business layer (Use Cases)
  const useCases = {
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

module.exports = { createNotificationTypesController };

