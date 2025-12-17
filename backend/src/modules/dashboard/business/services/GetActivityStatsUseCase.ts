/**
 * GetActivityStatsUseCase
 * Use case for retrieving activity statistics
 */

import type { IDashboardRepository, ActivityStatsByStatus } from '../interfaces/IDashboardRepository';

export interface ActivityStatsResult {
  statsByStatus: ActivityStatsByStatus[];
  totalActivities: number;
  totalRegistrations: number;
  timeRange: string;
}

class GetActivityStatsUseCase {
  private repository: IDashboardRepository;

  constructor(dashboardRepository: IDashboardRepository) {
    this.repository = dashboardRepository;
  }

  async execute(timeRange: string = '30d'): Promise<ActivityStatsResult> {
    const days = parseInt(timeRange.replace('d', ''), 10) || 30;
    const fromDate = new Date();
    fromDate.setDate(fromDate.getDate() - days);

    const [statsByStatus, totalActivities, totalRegistrations] = await Promise.all([
      this.repository.getActivityStatsByTimeRange(fromDate),
      this.repository.getTotalActivitiesCount(fromDate),
      this.repository.getTotalRegistrationsCount(fromDate)
    ]);

    return {
      statsByStatus,
      totalActivities,
      totalRegistrations,
      timeRange
    };
  }
}

export default GetActivityStatsUseCase;
