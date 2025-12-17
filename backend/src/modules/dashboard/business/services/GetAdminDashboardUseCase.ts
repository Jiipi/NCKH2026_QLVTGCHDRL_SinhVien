/**
 * GetAdminDashboardUseCase
 * Use case for retrieving admin dashboard overview
 */

import type { IDashboardRepository, AdminOverviewStats } from '../interfaces/IDashboardRepository';

class GetAdminDashboardUseCase {
  private repository: IDashboardRepository;

  constructor(dashboardRepository: IDashboardRepository) {
    this.repository = dashboardRepository;
  }

  async execute(): Promise<AdminOverviewStats> {
    return this.repository.getAdminOverviewStats();
  }
}

export default GetAdminDashboardUseCase;
