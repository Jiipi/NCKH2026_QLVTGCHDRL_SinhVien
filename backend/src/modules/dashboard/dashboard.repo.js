const DashboardPrismaRepository = require('./infrastructure/repositories/DashboardPrismaRepository');

/**
 * Dashboard Repository Facade
 * Provides a simple interface to access dashboard repository
 * Follows Facade Pattern for consistency with other modules
 */
class DashboardRepository {
  constructor() {
    this.repository = new DashboardPrismaRepository();
  }

  async getStudentInfo(userId) {
    return this.repository.getStudentInfo(userId);
  }

  async getClassStudents(lopId) {
    return this.repository.getClassStudents(lopId);
  }

  async getActivityTypes() {
    return this.repository.getActivityTypes();
  }

  async getStudentRegistrations(svId, activityFilter = {}) {
    return this.repository.getStudentRegistrations(svId, activityFilter);
  }

  async getUpcomingActivities(svId, classCreators = [], semesterFilter = {}) {
    return this.repository.getUpcomingActivities(svId, classCreators, semesterFilter);
  }

  async getUnreadNotificationsCount(userId) {
    return this.repository.getUnreadNotificationsCount(userId);
  }

  async getActivityStatsByTimeRange(fromDate) {
    return this.repository.getActivityStatsByTimeRange(fromDate);
  }

  async getTotalActivitiesCount(fromDate) {
    return this.repository.getTotalActivitiesCount(fromDate);
  }

  async getTotalRegistrationsCount(fromDate) {
    return this.repository.getTotalRegistrationsCount(fromDate);
  }

  async getAdminOverviewStats() {
    return this.repository.getAdminOverviewStats();
  }
}

module.exports = new DashboardRepository();

