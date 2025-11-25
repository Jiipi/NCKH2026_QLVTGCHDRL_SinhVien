/**
 * IActivityTypeRepository
 * Interface for activity type data access
 * Follows Dependency Inversion Principle (DIP)
 */
class IActivityTypeRepository {
  async findAll({ skip, take, search }) {
    throw new Error('Method not implemented');
  }

  async count(search) {
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
}

module.exports = IActivityTypeRepository;

