/**
 * INotificationRepository
 * Interface for notification data access
 * Follows Dependency Inversion Principle (DIP)
 */
class INotificationRepository {
  async findNotifications(filters, pagination) {
    throw new Error('Method not implemented');
  }

  async findById(notificationId) {
    throw new Error('Method not implemented');
  }

  async findByIdForUser(notificationId, userId, type) {
    throw new Error('Method not implemented');
  }

  async countUnread(userId) {
    throw new Error('Method not implemented');
  }

  async markAsRead(notificationId) {
    throw new Error('Method not implemented');
  }

  async markAllAsRead(userId) {
    throw new Error('Method not implemented');
  }

  async delete(notificationId) {
    throw new Error('Method not implemented');
  }

  async create(data) {
    throw new Error('Method not implemented');
  }

  async createMany(dataArray) {
    throw new Error('Method not implemented');
  }

  async findSentNotificationsBatch(userId, title, timestamp, windowMs) {
    throw new Error('Method not implemented');
  }

  async findActivity(criteria) {
    throw new Error('Method not implemented');
  }

  async getOrCreateNotificationType(loai_tb_id, defaultName) {
    throw new Error('Method not implemented');
  }

  async getStudentClassIds(userId) {
    throw new Error('Method not implemented');
  }

  async getTeacherClassIds(userId) {
    throw new Error('Method not implemented');
  }

  async getStudentsByClassIds(classIds) {
    throw new Error('Method not implemented');
  }

  async getActivityParticipants(activityId) {
    throw new Error('Method not implemented');
  }
}

module.exports = INotificationRepository;

