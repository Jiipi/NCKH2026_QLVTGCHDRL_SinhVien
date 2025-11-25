/**
 * IDashboardRepository
 * Interface for dashboard data access
 * Follows Dependency Inversion Principle (DIP)
 */
class IDashboardRepository {
  async getStudentInfo(userId) {
    throw new Error('Method not implemented');
  }

  async getClassStudents(lopId) {
    throw new Error('Method not implemented');
  }

  async getActivityTypes() {
    throw new Error('Method not implemented');
  }

  async getStudentRegistrations(svId, activityFilter) {
    throw new Error('Method not implemented');
  }

  async getUpcomingActivities(svId, classCreators, semesterFilter) {
    throw new Error('Method not implemented');
  }

  async getUnreadNotificationsCount(userId) {
    throw new Error('Method not implemented');
  }

  async getActivityStatsByTimeRange(fromDate) {
    throw new Error('Method not implemented');
  }

  async getTotalActivitiesCount(fromDate) {
    throw new Error('Method not implemented');
  }

  async getTotalRegistrationsCount(fromDate) {
    throw new Error('Method not implemented');
  }

  async getAdminOverviewStats() {
    throw new Error('Method not implemented');
  }
}

module.exports = IDashboardRepository;

