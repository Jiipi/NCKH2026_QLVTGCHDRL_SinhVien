const dashboardRepository = require('../data/repositories/dashboard.repository');
const GetStudentDashboardUseCase = require('../business/services/GetStudentDashboardUseCase');
const GetActivityStatsUseCase = require('../business/services/GetActivityStatsUseCase');
const GetAdminDashboardUseCase = require('../business/services/GetAdminDashboardUseCase');
const GetMyActivitiesUseCase = require('../business/services/GetMyActivitiesUseCase');
const GetDetailedScoresUseCase = require('../business/services/GetDetailedScoresUseCase');
const DashboardController = require('./controllers/DashboardController');

/**
 * Factory for creating DashboardController with dependencies
 */
function createDashboardController() {
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

module.exports = { createDashboardController };

