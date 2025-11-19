const DashboardDomainService = require('../../dashboard.service');

/**
 * GetAdminDashboardUseCase
 * Use case for retrieving admin dashboard overview
 */
class GetAdminDashboardUseCase {
  constructor(dashboardRepository) {
    this.dashboardService = new DashboardDomainService(dashboardRepository);
  }

  async execute() {
    return this.dashboardService.getAdminDashboard();
  }
}

module.exports = GetAdminDashboardUseCase;

