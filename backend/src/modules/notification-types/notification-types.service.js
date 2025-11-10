const { logInfo, logError } = require('../../utils/logger');
const notificationTypesRepo = require('./notification-types.repo');

class NotificationTypesService {
  /**
   * List all notification types
   * @returns {Promise<Array>} List of notification types
   */
  static async list() {
    try {
      logInfo('Getting notification types list');
      const items = await notificationTypesRepo.findAll();
      return items;
    } catch (error) {
      logError('Error getting notification types list', error);
      throw error;
    }
  }

  /**
   * Get notification type by ID
   * @param {string} id - Notification type ID
   * @returns {Promise<Object>} Notification type
   */
  static async getById(id) {
    try {
      logInfo('Getting notification type by ID', { id });
      const type = await notificationTypesRepo.findById(id);

      if (!type) {
        throw new Error('NOTIFICATION_TYPE_NOT_FOUND');
      }

      return type;
    } catch (error) {
      logError('Error getting notification type by ID', error);
      throw error;
    }
  }

  /**
   * Create notification type
   * @param {Object} data - Notification type data
   * @returns {Promise<Object>} Created notification type
   */
  static async create(data) {
    try {
      const { ten_loai_tb, mo_ta } = data;

      if (!ten_loai_tb || ten_loai_tb.trim() === '') {
        throw new Error('NOTIFICATION_TYPE_NAME_REQUIRED');
      }

      logInfo('Creating notification type', { ten_loai_tb });

      // Check for duplicates
      const exists = await notificationTypesRepo.findByName(ten_loai_tb);
      
      if (exists) {
        throw new Error('NOTIFICATION_TYPE_ALREADY_EXISTS');
      }

      const item = await notificationTypesRepo.create({ ten_loai_tb, mo_ta });
      return item;
    } catch (error) {
      logError('Error creating notification type', error);
      throw error;
    }
  }

  /**
   * Update notification type
   * @param {string} id - Notification type ID
   * @param {Object} data - Updated data
   * @returns {Promise<Object>} Updated notification type
   */
  static async update(id, data) {
    try {
      const { ten_loai_tb, mo_ta } = data;

      if (!ten_loai_tb || ten_loai_tb.trim() === '') {
        throw new Error('NOTIFICATION_TYPE_NAME_REQUIRED');
      }

      logInfo('Updating notification type', { id, ten_loai_tb });

      // Check if exists
      const existing = await notificationTypesRepo.findById(id);
      if (!existing) {
        throw new Error('NOTIFICATION_TYPE_NOT_FOUND');
      }

      // Check for duplicate name (excluding current record)
      const duplicate = await notificationTypesRepo.findByName(ten_loai_tb, id);

      if (duplicate) {
        throw new Error('NOTIFICATION_TYPE_ALREADY_EXISTS');
      }

      const updated = await notificationTypesRepo.update(id, { ten_loai_tb, mo_ta });
      return updated;
    } catch (error) {
      logError('Error updating notification type', error);
      throw error;
    }
  }

  /**
   * Delete notification type
   * @param {string} id - Notification type ID
   * @returns {Promise<boolean>} Success status
   */
  static async delete(id) {
    try {
      logInfo('Deleting notification type', { id });

      // Check if type is being used
      const count = await notificationTypesRepo.countNotificationsUsingType(id);

      if (count > 0) {
        throw new Error('NOTIFICATION_TYPE_IN_USE');
      }

      await notificationTypesRepo.delete(id);
      return true;
    } catch (error) {
      logError('Error deleting notification type', error);
      throw error;
    }
  }
}

module.exports = NotificationTypesService;
