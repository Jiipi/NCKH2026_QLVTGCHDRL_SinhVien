/**
 * IRoleRepository
 * Interface for role data access
 * Follows Dependency Inversion Principle (DIP)
 */
class IRoleRepository {
  async findMany(filters, pagination) {
    throw new Error('Method not implemented');
  }

  async findById(id) {
    throw new Error('Method not implemented');
  }

  async findByName(name) {
    throw new Error('Method not implemented');
  }

  async create(data) {
    throw new Error('Method not implemented');
  }

  async update(id, data) {
    throw new Error('Method not implemented');
  }

  async delete(id) {
    throw new Error('Method not implemented');
  }

  async countUsersWithRole(roleId) {
    throw new Error('Method not implemented');
  }

  async findUsersWithRole(roleId) {
    throw new Error('Method not implemented');
  }

  async reassignUsers(oldRoleId, newRoleId) {
    throw new Error('Method not implemented');
  }

  async assignRoleToUsers(roleId, userIds) {
    throw new Error('Method not implemented');
  }

  async countClassesWithHomeroom(userIds) {
    throw new Error('Method not implemented');
  }

  async findStudentsByUserIds(userIds) {
    throw new Error('Method not implemented');
  }

  async findActivitiesByCreators(userIds) {
    throw new Error('Method not implemented');
  }

  async cascadeDeleteUsers(userIds, studentIds, activityIds) {
    throw new Error('Method not implemented');
  }
}

module.exports = IRoleRepository;

