/**
 * GetActivityStatsUseCase
 * Use case for retrieving activity statistics
 */
class GetActivityStatsUseCase {
  constructor(dashboardRepository) {
    this.repository = dashboardRepository;
  }

  async execute(timeRange = '30d') {
    const days = parseInt(timeRange.replace('d', ''));
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

module.exports = GetActivityStatsUseCase;

