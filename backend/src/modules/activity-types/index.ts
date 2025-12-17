/**
 * Activity Types Module - TypeScript Index
 * Runtime entry point for CommonJS require()
 */
import routes from './presentation/routes/activity-types.routes';

// Export types from types file
export type {
  ActivityType,
  ActivityTypeWithCount,
  CreateActivityTypeDto as CreateActivityTypeDtoType,
  UpdateActivityTypeDto,
  ActivityTypeDto,
  ActivityTypeQueryOptions,
  PaginatedActivityTypesResult,
  IActivityTypesRepository,
  IGetActivityTypesUseCase,
  IGetActivityTypeByIdUseCase,
  ICreateActivityTypeUseCase,
  IUpdateActivityTypeUseCase,
  IDeleteActivityTypeUseCase,
  IActivityTypesController
} from './activity-types.types';

// Export types from new TypeScript files
export type { AuthenticatedRequest, ActivityTypeUseCases } from './presentation/controllers/ActivityTypesController';
export type { CreateActivityTypeInput } from './business/dto/CreateActivityTypeDto';
export type { FindAllParams, UpdateActivityTypeData } from './business/interfaces/IActivityTypeRepository';
export type { ListActivityTypesParams, ListActivityTypesResult } from './business/services/ListActivityTypesUseCase';

// Export routes
export { routes };
export const activityTypesRoutes = routes;

// Backward compatibility
export default { routes, activityTypesRoutes: routes };
module.exports = { routes, activityTypesRoutes: routes };
