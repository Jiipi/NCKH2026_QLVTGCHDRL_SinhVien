/**
 * IMonitorRepository
 * Interface for monitor data access
 * Follows Dependency Inversion Principle (DIP)
 */
class IMonitorRepository {
  async findStudentsByClass(classId) {
    throw new Error('Method not implemented');
  }

  async findStudentRegistrations(studentId, activityFilter) {
    throw new Error('Method not implemented');
  }

  async findClassRegistrationsForPoints(classId, activityFilter) {
    throw new Error('Method not implemented');
  }

  async findClassRegistrations(classId, filters) {
    throw new Error('Method not implemented');
  }

  async countPendingRegistrations(classId) {
    throw new Error('Method not implemented');
  }

  async findRegistrationById(registrationId) {
    throw new Error('Method not implemented');
  }

  async updateRegistrationStatus(registrationId, status, additionalData) {
    throw new Error('Method not implemented');
  }

  async createNotification(data) {
    throw new Error('Method not implemented');
  }

  async findNotificationTypeByName(name) {
    throw new Error('Method not implemented');
  }

  async findFirstNotificationType() {
    throw new Error('Method not implemented');
  }

  async countStudentsByClass(classId) {
    throw new Error('Method not implemented');
  }

  async countRegistrations(classId, filters) {
    throw new Error('Method not implemented');
  }

  async findRecentRegistrations(classId, activityFilter, limit) {
    throw new Error('Method not implemented');
  }

  async findUpcomingActivities(classId, activityFilter, limit) {
    throw new Error('Method not implemented');
  }

  async findClassById(classId) {
    throw new Error('Method not implemented');
  }

  async findAllStudentsInClass(classId) {
    throw new Error('Method not implemented');
  }

  async findClassRegistrationsForCountApproved(classId, activityFilter) {
    throw new Error('Method not implemented');
  }

  async countActivitiesForClassStrict(classId, semesterWhere) {
    throw new Error('Method not implemented');
  }

  async findClassRegistrationsForReports(classId, activityFilter) {
    throw new Error('Method not implemented');
  }
}

module.exports = IMonitorRepository;

