const AuthPrismaRepository = require('./infrastructure/repositories/AuthPrismaRepository');

/**
 * Auth Repository Facade
 * Provides a simple interface to access auth repository
 * Follows Facade Pattern for consistency with other modules
 */
class AuthRepository {
  constructor() {
    this.repository = new AuthPrismaRepository();
  }

  async findByEmailOrMaso(emailOrMaso) {
    return this.repository.findByEmailOrMaso(emailOrMaso);
  }

  async findUserByEmail(email) {
    return this.repository.findUserByEmail(email);
  }

  async findUserByMaso(maso) {
    return this.repository.findUserByMaso(maso);
  }

  async findUserById(id) {
    return this.repository.findUserById(id);
  }

  async createUser(userData) {
    return this.repository.createUser(userData);
  }

  async updateUser(userId, updateData) {
    return this.repository.updateUser(userId, updateData);
  }

  async createStudent(studentData) {
    return this.repository.createStudent(studentData);
  }

  async findRoleByName(roleName) {
    return this.repository.findRoleByName(roleName);
  }

  async createRole(roleData) {
    return this.repository.createRole(roleData);
  }

  async countUsers() {
    return this.repository.countUsers();
  }
}

module.exports = new AuthRepository();

