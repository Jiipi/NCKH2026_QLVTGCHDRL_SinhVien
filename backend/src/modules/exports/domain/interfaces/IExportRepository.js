/**
 * IExportRepository
 * Interface for export data access
 * Follows Dependency Inversion Principle (DIP)
 */
class IExportRepository {
  async groupActivitiesByStatus(activityWhere) {
    throw new Error('Method not implemented');
  }

  async findTopActivities(activityWhere, limit) {
    throw new Error('Method not implemented');
  }

  async groupRegistrationsByDate(activityWhere) {
    throw new Error('Method not implemented');
  }

  async findActivitiesForExport(activityWhere, useOrderBy) {
    throw new Error('Method not implemented');
  }

  async findRegistrationsForExport(activityWhere, limit) {
    throw new Error('Method not implemented');
  }
}

module.exports = IExportRepository;

