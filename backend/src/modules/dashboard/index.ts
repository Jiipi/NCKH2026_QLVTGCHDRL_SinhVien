/**
 * Dashboard Module - TypeScript Index
 */

// Export types
export type {
  StudentInfo,
  ClassStudentInfo,
  ActivityTypeSummary,
  StudentRegistration,
  UpcomingActivity,
  DashboardStats,
  PointsByCategory,
  DashboardActivityFilter,
  SemesterFilter,
  IDashboardRepository,
  IGetDashboardStatsUseCase,
  IGetUpcomingActivitiesUseCase,
  IDashboardController
} from './dashboard.types';

// Export interfaces and types from subdirectories
export type {
  IDashboardRepository as DashboardRepositoryInterface,
  AdminOverviewStats,
  ActivityStatsByStatus,
  ClassRegistration,
  AdminChartStats
} from './business/interfaces/IDashboardRepository';

export { calculateActivityPoints, type ActivityWithPoints } from './business/utils/activityPoints';

// Export use cases
export { default as GetStudentDashboardUseCase } from './business/services/GetStudentDashboardUseCase';
export { default as GetActivityStatsUseCase } from './business/services/GetActivityStatsUseCase';
export { default as GetAdminDashboardUseCase } from './business/services/GetAdminDashboardUseCase';
export { default as GetMyActivitiesUseCase } from './business/services/GetMyActivitiesUseCase';
export { default as GetDetailedScoresUseCase } from './business/services/GetDetailedScoresUseCase';
export { default as GetAdminChartStatsUseCase } from './business/services/GetAdminChartStatsUseCase';

// Export repository
export { default as dashboardRepository } from './data/repositories/dashboard.repository';

// Export controller and factory
export { default as DashboardController } from './presentation/controllers/DashboardController';
export { createDashboardController } from './presentation/dashboard.factory';

// Export routes
import routes from './presentation/routes/dashboard.routes';
export { routes };

// CommonJS compatibility
module.exports = { routes };
