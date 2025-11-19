const IActivityRepository = require('../../domain/interfaces/IActivityRepository');
const activitiesRepo = require('../../activities.repo');

/**
 * ActivityPrismaRepository
 * Prisma implementation of IActivityRepository
 * Follows Dependency Inversion Principle (DIP)
 */
class ActivityPrismaRepository extends IActivityRepository {
  async findMany(where, options) {
    return activitiesRepo.findMany(where, options);
  }

  async findById(id, where, include) {
    return activitiesRepo.findById(id, where, include);
  }

  async create(data) {
    return activitiesRepo.create(data);
  }

  async update(id, data) {
    return activitiesRepo.update(id, data);
  }

  async delete(id) {
    return activitiesRepo.delete(id);
  }

  async count(where) {
    return activitiesRepo.count(where);
  }
}

module.exports = ActivityPrismaRepository;

