/**
 * ISemesterRepository
 * Interface for semester data access
 * Follows Dependency Inversion Principle (DIP)
 */
class ISemesterRepository {
  async getSemesterOptions() {
    throw new Error('Method getSemesterOptions must be implemented');
  }

  async getAllClasses() {
    throw new Error('Method getAllClasses must be implemented');
  }

  async getClassDetail(classId) {
    throw new Error('Method getClassDetail must be implemented');
  }

  async getClassStudents(classId) {
    throw new Error('Method getClassStudents must be implemented');
  }

  async getActivitiesBySemester(classId, semester) {
    throw new Error('Method getActivitiesBySemester must be implemented');
  }

  async getRegistrationsBySemester(classId, semester) {
    throw new Error('Method getRegistrationsBySemester must be implemented');
  }
}

module.exports = ISemesterRepository;

