/**
 * GetAdminDashboardUseCase
 * Use case for retrieving admin dashboard overview
 */
class GetAdminDashboardUseCase {
  constructor(dashboardRepository) {
    this.repository = dashboardRepository;
  }

  async execute() {
    return this.repository.getAdminOverviewStats();
  }
}

module.exports = GetAdminDashboardUseCase;

