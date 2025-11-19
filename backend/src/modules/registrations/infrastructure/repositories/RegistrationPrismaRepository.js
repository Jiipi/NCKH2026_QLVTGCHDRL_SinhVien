const IRegistrationRepository = require('../../domain/interfaces/IRegistrationRepository');
const registrationsRepo = require('../../registrations.repo');

/**
 * RegistrationPrismaRepository
 * Prisma implementation of IRegistrationRepository
 * Follows Dependency Inversion Principle (DIP)
 */
class RegistrationPrismaRepository extends IRegistrationRepository {
  async findMany(params) {
    return registrationsRepo.findMany(params);
  }

  async findById(id, include) {
    return registrationsRepo.findById(id, include);
  }

  async findByUserAndActivity(userId, activityId) {
    return registrationsRepo.findByUserAndActivity(userId, activityId);
  }

  async create(data) {
    return registrationsRepo.create(data);
  }

  async update(id, data) {
    return registrationsRepo.update(id, data);
  }

  async delete(id) {
    return registrationsRepo.delete(id);
  }

  async bulkApprove(ids, approverId) {
    return registrationsRepo.bulkApprove(ids, approverId);
  }

  async bulkReject(ids, reason) {
    return registrationsRepo.bulkReject(ids, reason);
  }

  async checkIn(id, checkInTime) {
    return registrationsRepo.checkIn(id, checkInTime);
  }

  async findByUser(userId, filters) {
    return registrationsRepo.findByUser(userId, filters);
  }

  async getActivityStats(activityId) {
    return registrationsRepo.getActivityStats(activityId);
  }
}

module.exports = RegistrationPrismaRepository;

