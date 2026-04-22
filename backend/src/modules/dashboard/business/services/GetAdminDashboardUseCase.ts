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

  async execute(
    scope?: { where: any; permissions: any },
    semester?: { hoc_ky: string; nam_hoc: string }
  ): Promise<AdminOverviewStats> {
    // Admin có thể thấy tất cả, nhưng vẫn respect semester filter nếu có
    return this.repository.getAdminOverviewStats(semester);
  }
}

export default GetAdminDashboardUseCase;
