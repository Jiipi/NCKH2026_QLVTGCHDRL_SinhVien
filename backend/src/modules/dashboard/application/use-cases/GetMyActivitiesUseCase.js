const DashboardDomainService = require('../../dashboard.service');

/**
 * GetMyActivitiesUseCase
 * Use case for retrieving student's registered activities
 */
class GetMyActivitiesUseCase {
  constructor(dashboardRepository) {
    this.dashboardService = new DashboardDomainService(dashboardRepository);
  }

  async execute(userId, query = {}) {
    return this.dashboardService.getMyActivities(userId, query);
  }
}

module.exports = GetMyActivitiesUseCase;

