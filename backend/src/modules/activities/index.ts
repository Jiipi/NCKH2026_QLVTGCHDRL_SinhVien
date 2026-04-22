/**
 * Activities Module - TypeScript Index
 * Export types and module components
 * 
 * @module modules/activities
 */

// Export all types
export type {
  // Entity types
  ActivityWithRelations,
  DangKyHoatDongWithStudent,
  LoaiHoatDongWithCount,
  
  // DTO types
  CreateActivityDto,
  UpdateActivityDto,
  ActivityDto,
  ActivityFilterOptions,
  RegistrationDto,
  
  // Pagination types
  PaginationOptions,
  PaginatedResult,
  
  // Repository interfaces
  IActivityRepository,
  IRegistrationRepository,
  
  // Use case interfaces
  UserContext,
  IGetActivitiesUseCase,
  IGetActivityByIdUseCase,
  ICreateActivityUseCase,
  IUpdateActivityUseCase,
  IDeleteActivityUseCase,
  IRegisterActivityUseCase,
  ICancelRegistrationUseCase,
  IApproveActivityUseCase,
  IRejectActivityUseCase,
  IGetActivityQRDataUseCase,
  IScanAttendanceUseCase
} from './activities.types';

// Export factory function
import { createActivitiesController } from './presentation/activities.factory';
export { createActivitiesController };

// Export routes - get the router instance, not the factory function
import routesModule from './presentation/routes/activities.routes';
const routes = routesModule.router || routesModule.default?.router || routesModule;

export { routes };

// Default export
export default { createActivitiesController, routes };

// CommonJS compatibility  
module.exports = {
  createActivitiesController,
  routes
};
module.exports.default = { createActivitiesController, routes };
