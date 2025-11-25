const activityTypesRepository = require('../data/repositories/activity-types.repository');
const ListActivityTypesUseCase = require('../business/services/ListActivityTypesUseCase');
const GetActivityTypeByIdUseCase = require('../business/services/GetActivityTypeByIdUseCase');
const CreateActivityTypeUseCase = require('../business/services/CreateActivityTypeUseCase');
const UpdateActivityTypeUseCase = require('../business/services/UpdateActivityTypeUseCase');
const DeleteActivityTypeUseCase = require('../business/services/DeleteActivityTypeUseCase');
const ActivityTypesController = require('./controllers/ActivityTypesController');

/**
 * Factory for creating ActivityTypesController with all dependencies
 * Implements Dependency Injection pattern
 */
function createActivityTypesController() {
  // Data layer
  const repo = activityTypesRepository;

  // Business layer (Use Cases)
  const useCases = {
    list: new ListActivityTypesUseCase(repo),
    getById: new GetActivityTypeByIdUseCase(repo),
    create: new CreateActivityTypeUseCase(repo),
    update: new UpdateActivityTypeUseCase(repo),
    delete: new DeleteActivityTypeUseCase(repo)
  };

  // Presentation layer
  const controller = new ActivityTypesController(useCases);

  return controller;
}

module.exports = { createActivityTypesController };

