/**
 * IPointsRepository
 * Interface for points data access
 * Follows Dependency Inversion Principle (DIP)
 */
class IPointsRepository {
  async findStudentByUserId(userId) {
    throw new Error('Method not implemented');
  }

  async findAttendedRegistrations(studentId, filters) {
    throw new Error('Method not implemented');
  }

  async findAllRegistrations(studentId) {
    throw new Error('Method not implemented');
  }

  async getRegistrationStatusCounts(studentId) {
    throw new Error('Method not implemented');
  }

  async findRegistrationsWithPagination(studentId, filters, pagination) {
    throw new Error('Method not implemented');
  }

  async findAttendanceRecords(studentId, pagination) {
    throw new Error('Method not implemented');
  }

  async getUniqueSemesters(studentId) {
    throw new Error('Method not implemented');
  }

  async getUniqueAcademicYears(studentId) {
    throw new Error('Method not implemented');
  }

  async findCompletedRegistrationsForSemester(studentId, hocKy, namHoc) {
    throw new Error('Method not implemented');
  }
}

module.exports = IPointsRepository;

