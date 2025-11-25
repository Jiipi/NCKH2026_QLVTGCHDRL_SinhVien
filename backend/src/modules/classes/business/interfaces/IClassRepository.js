/**
 * IClassRepository
 * Interface for class data access
 * Follows Dependency Inversion Principle (DIP)
 */
class IClassRepository {
  async findMany({ where, skip, limit, orderBy }) {
    throw new Error('Method findMany must be implemented');
  }

  async findById(id, include) {
    throw new Error('Method findById must be implemented');
  }

  async findByName(name) {
    throw new Error('Method findByName must be implemented');
  }

  async create(data) {
    throw new Error('Method create must be implemented');
  }

  async update(id, data) {
    throw new Error('Method update must be implemented');
  }

  async delete(id) {
    throw new Error('Method delete must be implemented');
  }

  async exists(id) {
    throw new Error('Method exists must be implemented');
  }

  async findByFaculty(faculty) {
    throw new Error('Method findByFaculty must be implemented');
  }

  async assignTeacher(classId, teacherId) {
    throw new Error('Method assignTeacher must be implemented');
  }

  async removeTeacher(classId, teacherId) {
    throw new Error('Method removeTeacher must be implemented');
  }

  async getStats(classId) {
    throw new Error('Method getStats must be implemented');
  }

  async getStudents(classId) {
    throw new Error('Method getStudents must be implemented');
  }

  async getActivities(classId) {
    throw new Error('Method getActivities must be implemented');
  }
}

module.exports = IClassRepository;

