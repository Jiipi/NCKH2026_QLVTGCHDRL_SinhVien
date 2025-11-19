/**
 * IUserRepository
 * Interface for user data access
 * Follows Dependency Inversion Principle (DIP)
 */
class IUserRepository {
  async findMany({ where, skip, limit, orderBy, select }) {
    throw new Error('Method findMany must be implemented');
  }

  async findById(id, select) {
    throw new Error('Method findById must be implemented');
  }

  async findByMSSV(mssv, select) {
    throw new Error('Method findByMSSV must be implemented');
  }

  async findByEmail(email, select) {
    throw new Error('Method findByEmail must be implemented');
  }

  async create(data) {
    throw new Error('Method create must be implemented');
  }

  async update(id, data) {
    throw new Error('Method update must be implemented');
  }

  async softDelete(id) {
    throw new Error('Method softDelete must be implemented');
  }

  async delete(id) {
    throw new Error('Method delete must be implemented');
  }

  async exists(id) {
    throw new Error('Method exists must be implemented');
  }

  async countByRole(role) {
    throw new Error('Method countByRole must be implemented');
  }

  async findByClass(className) {
    throw new Error('Method findByClass must be implemented');
  }

  async findByFaculty(faculty) {
    throw new Error('Method findByFaculty must be implemented');
  }

  async search(searchTerm) {
    throw new Error('Method search must be implemented');
  }

  async getStats() {
    throw new Error('Method getStats must be implemented');
  }
}

module.exports = IUserRepository;

