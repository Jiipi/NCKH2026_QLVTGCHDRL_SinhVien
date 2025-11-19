const DashboardDomainService = require('../../dashboard.service');

/**
 * GetActivityStatsUseCase
 * Use case for retrieving activity statistics
 */
class GetActivityStatsUseCase {
  constructor(dashboardRepository) {
    this.dashboardService = new DashboardDomainService(dashboardRepository);
  }

  async execute(timeRange = '30d') {
    return this.dashboardService.getActivityStats(timeRange);
  }
}

module.exports = GetActivityStatsUseCase;

