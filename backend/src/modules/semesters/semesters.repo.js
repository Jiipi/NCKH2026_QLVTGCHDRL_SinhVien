const SemesterPrismaRepository = require('./infrastructure/repositories/SemesterPrismaRepository');

/**
 * Semesters Repository Facade
 * Provides a simple interface to access semester repository
 * Follows Facade Pattern for consistency with other modules
 */
class SemestersRepository {
  constructor() {
    this.repository = new SemesterPrismaRepository();
  }

  async getSemesterOptions() {
    return this.repository.getSemesterOptions();
  }

  async getAllClasses() {
    return this.repository.getAllClasses();
  }

  async getClassDetail(classId) {
    return this.repository.getClassDetail(classId);
  }

  async getClassStudents(classId) {
    return this.repository.getClassStudents(classId);
  }

  async getActivitiesBySemester(classId, semester) {
    return this.repository.getActivitiesBySemester(classId, semester);
  }

  async getRegistrationsBySemester(classId, semester) {
    return this.repository.getRegistrationsBySemester(classId, semester);
  }

  async createNextSemester(currentSemester) {
    return this.repository.createNextSemester(currentSemester);
  }
}

module.exports = new SemestersRepository();

