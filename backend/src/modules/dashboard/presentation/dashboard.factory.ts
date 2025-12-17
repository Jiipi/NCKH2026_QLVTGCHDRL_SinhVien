/**
 * Factory for creating DashboardController with dependencies
 */

import dashboardRepository from '../data/repositories/dashboard.repository';
import GetStudentDashboardUseCase from '../business/services/GetStudentDashboardUseCase';
import GetActivityStatsUseCase from '../business/services/GetActivityStatsUseCase';
import GetAdminDashboardUseCase from '../business/services/GetAdminDashboardUseCase';
import GetMyActivitiesUseCase from '../business/services/GetMyActivitiesUseCase';
import GetDetailedScoresUseCase from '../business/services/GetDetailedScoresUseCase';
import DashboardController from './controllers/DashboardController';

export function createDashboardController(): DashboardController {
  const repo = dashboardRepository;

  const useCases = {
    getStudentDashboard: new GetStudentDashboardUseCase(repo),
    getActivityStats: new GetActivityStatsUseCase(repo),
    getAdminDashboard: new GetAdminDashboardUseCase(repo),
    getMyActivities: new GetMyActivitiesUseCase(repo),
    getDetailedScores: new GetDetailedScoresUseCase(repo)
  };

  return new DashboardController(useCases);
}

export default { createDashboardController };
