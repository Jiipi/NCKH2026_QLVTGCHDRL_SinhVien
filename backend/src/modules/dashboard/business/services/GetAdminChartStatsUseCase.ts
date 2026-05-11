/**
 * GetAdminChartStatsUseCase
 * Use case for retrieving admin dashboard chart data
 */

import type { IDashboardRepository, AdminChartStats } from '../interfaces/IDashboardRepository';

class GetAdminChartStatsUseCase {
  private repository: IDashboardRepository;

  constructor(dashboardRepository: IDashboardRepository) {
    this.repository = dashboardRepository;
  }

  async execute(semester?: { hoc_ky: string; nam_hoc: string }): Promise<AdminChartStats> {
    return this.repository.getAdminChartStats(semester);
  }
}

export default GetAdminChartStatsUseCase;
