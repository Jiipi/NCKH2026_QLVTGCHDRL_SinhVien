import activityTypesRepository from '../data/repositories/activity-types.repository';
import ListActivityTypesUseCase from '../business/services/ListActivityTypesUseCase';
import GetActivityTypeByIdUseCase from '../business/services/GetActivityTypeByIdUseCase';
import CreateActivityTypeUseCase from '../business/services/CreateActivityTypeUseCase';
import UpdateActivityTypeUseCase from '../business/services/UpdateActivityTypeUseCase';
import DeleteActivityTypeUseCase from '../business/services/DeleteActivityTypeUseCase';
import ActivityTypesController from './controllers/ActivityTypesController';
import type { ActivityTypeUseCases } from './controllers/ActivityTypesController';

/**
 * Factory for creating ActivityTypesController with all dependencies
 * Implements Dependency Injection pattern
 */
export function createActivityTypesController(): ActivityTypesController {
  // Data layer
  const repo = activityTypesRepository;

  // Business layer (Use Cases)
  const useCases: ActivityTypeUseCases = {
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

export default { createActivityTypesController };
module.exports = { createActivityTypesController };
