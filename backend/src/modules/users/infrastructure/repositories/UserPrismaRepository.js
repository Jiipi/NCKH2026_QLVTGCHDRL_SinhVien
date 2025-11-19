const IUserRepository = require('../../domain/interfaces/IUserRepository');
const usersRepo = require('../../users.repo');

/**
 * UserPrismaRepository
 * Prisma implementation of IUserRepository
 * Follows Dependency Inversion Principle (DIP)
 */
class UserPrismaRepository extends IUserRepository {
  async findMany({ where, skip, limit, orderBy, select }) {
    return usersRepo.findMany({ where, skip, limit, orderBy, select });
  }

  async findById(id, select) {
    return usersRepo.findById(id, select);
  }

  async findByMSSV(mssv, select) {
    return usersRepo.findByMSSV(mssv, select);
  }

  async findByEmail(email, select) {
    return usersRepo.findByEmail(email, select);
  }

  async create(data) {
    return usersRepo.create(data);
  }

  async update(id, data) {
    return usersRepo.update(id, data);
  }

  async softDelete(id) {
    return usersRepo.softDelete(id);
  }

  async delete(id) {
    return usersRepo.delete(id);
  }

  async exists(id) {
    return usersRepo.exists(id);
  }

  async countByRole(role) {
    return usersRepo.countByRole(role);
  }

  async findByClass(className) {
    return usersRepo.findByClass(className);
  }

  async findByFaculty(faculty) {
    return usersRepo.findByFaculty(faculty);
  }

  async search(searchTerm) {
    return usersRepo.search(searchTerm);
  }

  async getStats() {
    return usersRepo.getStats();
  }
}

module.exports = UserPrismaRepository;

