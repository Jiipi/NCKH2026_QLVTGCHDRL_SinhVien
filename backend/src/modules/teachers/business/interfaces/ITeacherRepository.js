/**
 * ITeacherRepository
 * Interface for teacher data access
 * Follows Dependency Inversion Principle (DIP)
 */
class ITeacherRepository {
  async getDashboardStats(teacherId, semester, classId) {
    throw new Error('Method not implemented');
  }

  async getPendingActivitiesList(teacherId, semester, limit, classId) {
    throw new Error('Method not implemented');
  }

  async getTeacherClasses(teacherId, include) {
    throw new Error('Method not implemented');
  }

  async getTeacherStudents(teacherId, filters) {
    throw new Error('Method not implemented');
  }

  async getClassStats(className, semesterId) {
    throw new Error('Method not implemented');
  }

  async getClassRegistrations(classIds, filters) {
    throw new Error('Method not implemented');
  }

  async hasAccessToClass(teacherId, className) {
    throw new Error('Method not implemented');
  }

  async assignClassMonitor(teacherId, classId, studentId) {
    throw new Error('Method not implemented');
  }

  async createStudent(teacherId, payload) {
    throw new Error('Method not implemented');
  }

  async exportStudents(teacherId) {
    throw new Error('Method not implemented');
  }

  async getTeacherClassNames(teacherId) {
    throw new Error('Method not implemented');
  }

  async getTeacherClassRegistrationsForChartsAll(teacherId, semesterId) {
    throw new Error('Method not implemented');
  }

  async getTeacherClassRegistrationsForReports(teacherId, semesterId) {
    throw new Error('Method not implemented');
  }

  async countActivitiesForTeacherClassesStrict(teacherId, semesterId) {
    throw new Error('Method not implemented');
  }
}

module.exports = ITeacherRepository;

