/**
 * IActivityRepository Interface
 * Contract for activity data access
 * Follows Dependency Inversion Principle (DIP)
 */
class IActivityRepository {
  async findMany(where, options) {
    throw new Error('Must implement findMany()');
  }

  async findById(id, where, include) {
    throw new Error('Must implement findById()');
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

  async count(where) {
    throw new Error('Must implement count()');
  }
}

module.exports = IActivityRepository;

