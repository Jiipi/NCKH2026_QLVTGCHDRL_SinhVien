/**
 * ISearchRepository
 * Interface for search data access
 * Follows Dependency Inversion Principle (DIP)
 */
class ISearchRepository {
  async searchActivities(filters, options) {
    throw new Error('Method not implemented');
  }

  async searchStudents(filters, options) {
    throw new Error('Method not implemented');
  }

  async searchClasses(filters, options) {
    throw new Error('Method not implemented');
  }

  async searchTeachers(filters, options) {
    throw new Error('Method not implemented');
  }

  async getStudentByUserId(userId) {
    throw new Error('Method not implemented');
  }

  async getClassCreators(classId) {
    throw new Error('Method not implemented');
  }

  async getClassHomeroom(classId) {
    throw new Error('Method not implemented');
  }

  async getTeacherClasses(teacherId) {
    throw new Error('Method not implemented');
  }
}

module.exports = ISearchRepository;

