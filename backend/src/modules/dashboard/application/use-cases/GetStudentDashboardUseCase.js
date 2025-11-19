const DashboardDomainService = require('../../dashboard.service');

/**
 * GetStudentDashboardUseCase
 * Use case for retrieving student dashboard data
 */
class GetStudentDashboardUseCase {
  constructor(dashboardRepository) {
    this.dashboardService = new DashboardDomainService(dashboardRepository);
  }

  async execute(userId, query) {
    return this.dashboardService.getStudentDashboard(userId, query);
  }
}

module.exports = GetStudentDashboardUseCase;

