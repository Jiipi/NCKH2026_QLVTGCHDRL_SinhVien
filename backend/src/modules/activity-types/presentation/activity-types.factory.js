const ActivityTypePrismaRepository = require('../infrastructure/repositories/ActivityTypePrismaRepository');
const ListActivityTypesUseCase = require('../application/use-cases/ListActivityTypesUseCase');
const GetActivityTypeByIdUseCase = require('../application/use-cases/GetActivityTypeByIdUseCase');
const CreateActivityTypeUseCase = require('../application/use-cases/CreateActivityTypeUseCase');
const UpdateActivityTypeUseCase = require('../application/use-cases/UpdateActivityTypeUseCase');
const DeleteActivityTypeUseCase = require('../application/use-cases/DeleteActivityTypeUseCase');
const ActivityTypesController = require('./ActivityTypesController');

/**
 * Factory for creating ActivityTypesController with all dependencies
 * Implements Dependency Injection pattern
 */
function createActivityTypesController() {
  // Infrastructure layer
  const activityTypeRepository = new ActivityTypePrismaRepository();

  // Application layer (Use Cases)
  const useCases = {
    list: new ListActivityTypesUseCase(activityTypeRepository),
    getById: new GetActivityTypeByIdUseCase(activityTypeRepository),
    create: new CreateActivityTypeUseCase(activityTypeRepository),
    update: new UpdateActivityTypeUseCase(activityTypeRepository),
    delete: new DeleteActivityTypeUseCase(activityTypeRepository)
  };

  // Presentation layer
  const controller = new ActivityTypesController(useCases);

  return controller;
}

module.exports = { createActivityTypesController };

