/**
 * IRegistrationRepository Interface
 * Contract for registration data access
 * Follows Dependency Inversion Principle (DIP)
 */
class IRegistrationRepository {
  async findMany(params) {
    throw new Error('Must implement findMany()');
  }

  async findById(id, include) {
    throw new Error('Must implement findById()');
  }

  async findByUserAndActivity(userId, activityId) {
    throw new Error('Must implement findByUserAndActivity()');
  }

  async create(data) {
    throw new Error('Must implement create()');
  }

  async update(id, data) {
    throw new Error('Must implement update()');
  }

  async delete(id) {
    throw new Error('Must implement delete()');
  }

  async bulkApprove(ids, approverId) {
    throw new Error('Must implement bulkApprove()');
  }

  async bulkReject(ids, reason) {
    throw new Error('Must implement bulkReject()');
  }

  async checkIn(id, checkInTime) {
    throw new Error('Must implement checkIn()');
  }

  async findByUser(userId, filters) {
    throw new Error('Must implement findByUser()');
  }

  async getActivityStats(activityId) {
    throw new Error('Must implement getActivityStats()');
  }
}

module.exports = IRegistrationRepository;

