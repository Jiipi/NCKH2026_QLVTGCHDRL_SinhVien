const DashboardPrismaRepository = require('../infrastructure/repositories/DashboardPrismaRepository');
const GetStudentDashboardUseCase = require('../application/use-cases/GetStudentDashboardUseCase');
const GetActivityStatsUseCase = require('../application/use-cases/GetActivityStatsUseCase');
const GetAdminDashboardUseCase = require('../application/use-cases/GetAdminDashboardUseCase');
const GetMyActivitiesUseCase = require('../application/use-cases/GetMyActivitiesUseCase');
const GetDetailedScoresUseCase = require('../application/use-cases/GetDetailedScoresUseCase');
const DashboardController = require('./DashboardController');

/**
 * Factory for creating DashboardController with dependencies
 */
function createDashboardController() {
  const dashboardRepository = new DashboardPrismaRepository();

  const useCases = {
    getStudentDashboard: new GetStudentDashboardUseCase(dashboardRepository),
    getActivityStats: new GetActivityStatsUseCase(dashboardRepository),
    getAdminDashboard: new GetAdminDashboardUseCase(dashboardRepository),
    getMyActivities: new GetMyActivitiesUseCase(dashboardRepository),
    getDetailedScores: new GetDetailedScoresUseCase(dashboardRepository)
  };

  return new DashboardController(useCases);
}

module.exports = { createDashboardController };

