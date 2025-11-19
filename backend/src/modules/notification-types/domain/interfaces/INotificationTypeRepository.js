/**
 * INotificationTypeRepository
 * Interface for notification type data access
 * Follows Dependency Inversion Principle (DIP)
 */
class INotificationTypeRepository {
  async findAll(orderBy) {
    throw new Error('Method not implemented');
  }

  async findById(id) {
    throw new Error('Method not implemented');
  }

  async findByName(name, excludeId) {
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

  async countNotificationsUsingType(typeId) {
    throw new Error('Method not implemented');
  }
}

module.exports = INotificationTypeRepository;

