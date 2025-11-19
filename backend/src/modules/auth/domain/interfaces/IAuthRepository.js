/**
 * IAuthRepository Interface
 * Contract for authentication data access
 * Follows Dependency Inversion Principle (DIP)
 */
class IAuthRepository {
  async findByEmailOrMaso(emailOrMaso) {
    throw new Error('Must implement findByEmailOrMaso()');
  }

  async findUserByMaso(maso) {
    throw new Error('Must implement findUserByMaso()');
  }

  async findUserByEmail(email) {
    throw new Error('Must implement findUserByEmail()');
  }

  async findUserById(id) {
    throw new Error('Must implement findUserById()');
  }

  async createUser(userData) {
    throw new Error('Must implement createUser()');
  }

  async updateUser(id, updateData) {
    throw new Error('Must implement updateUser()');
  }

  async findRoleByName(roleName) {
    throw new Error('Must implement findRoleByName()');
  }

  async createRole(roleData) {
    throw new Error('Must implement createRole()');
  }

  async createStudent(studentData) {
    throw new Error('Must implement createStudent()');
  }

  async countUsers() {
    throw new Error('Must implement countUsers()');
  }
}

module.exports = IAuthRepository;

