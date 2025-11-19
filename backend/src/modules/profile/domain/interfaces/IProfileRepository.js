/**
 * IProfileRepository
 * Interface for profile data access
 * Follows Dependency Inversion Principle (DIP)
 */
class IProfileRepository {
  async findUserById(userId) {
    throw new Error('Method not implemented');
  }

  async updateUser(userId, data) {
    throw new Error('Method not implemented');
  }

  async findByEmail(email, excludeUserId) {
    throw new Error('Method not implemented');
  }

  async updatePassword(userId, hashedPassword) {
    throw new Error('Method not implemented');
  }

  async findStudentWithMonitorInfo(userId) {
    throw new Error('Method not implemented');
  }

  async findClassWithMonitor(lopId) {
    throw new Error('Method not implemented');
  }
}

module.exports = IProfileRepository;

