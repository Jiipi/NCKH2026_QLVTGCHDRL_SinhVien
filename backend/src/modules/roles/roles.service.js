const { logInfo, logError } = require('../../core/logger');
const { invalidateRoleCache, invalidateAllRoleCache } = require('../../core/policies');
const rolesRepo = require('./roles.repo');

class RolesService {
  /**
   * List all roles
   * @param {Object} options - Pagination and search options
   * @returns {Promise<Object>} Paginated roles list
   */
  static async list(options = {}) {
    try {
      const { page = 1, limit = 20, search } = options;

      logInfo('Getting roles list', { page, limit, search });

      const { items, total } = await rolesRepo.findMany({ search }, { page, limit });

      // Convert quyen_han from object to array for all items
      items.forEach(item => {
        if (item.quyen_han && typeof item.quyen_han === 'object' && !Array.isArray(item.quyen_han)) {
          item.quyen_han = Object.values(item.quyen_han);
        }
      });

      return {
        items,
        total,
        page: parseInt(page),
        limit: parseInt(limit)
      };
    } catch (error) {
      logError('Error getting roles list', error);
      throw error;
    }
  }

  /**
   * Get role by ID
   * @param {string} id - Role ID
   * @returns {Promise<Object>} Role data
   */
  static async getById(id) {
    try {
      logInfo('Getting role by ID', { id });

      const item = await rolesRepo.findById(id);

      if (!item) {
        throw new Error('ROLE_NOT_FOUND');
      }

      // Convert quyen_han from object to array if needed
      if (item.quyen_han && typeof item.quyen_han === 'object' && !Array.isArray(item.quyen_han)) {
        item.quyen_han = Object.values(item.quyen_han);
      }

      return item;
    } catch (error) {
      logError('Error getting role by ID', error);
      throw error;
    }
  }

  /**
   * Create role
   * @param {Object} data - Role data
   * @param {string} adminId - Admin user ID
   * @returns {Promise<Object>} Created role
   */
  static async create(data, adminId) {
    try {
      const { ten_vt, mo_ta, quyen_han } = data;

      if (!ten_vt) {
        throw new Error('ROLE_NAME_REQUIRED');
      }

      logInfo('Creating role', { ten_vt, adminId });

      // Check if role already exists
      const exists = await rolesRepo.findByName(ten_vt);
      if (exists) {
        throw new Error('ROLE_ALREADY_EXISTS');
      }

      const item = await rolesRepo.create({ ten_vt, mo_ta, quyen_han });

      logInfo('Role created', { adminId, roleId: item.id });
      invalidateRoleCache(ten_vt);

      return item;
    } catch (error) {
      logError('Error creating role', error);
      throw error;
    }
  }

  /**
   * Update role
   * @param {string} id - Role ID
   * @param {Object} data - Updated role data
   * @returns {Promise<Object>} Updated role
   */
  static async update(id, data) {
    try {
      const { ten_vt, mo_ta, quyen_han } = data;

      logInfo('Updating role', { id, ten_vt });

      // Ensure quyen_han is an array
      let normalizedQuyenHan = quyen_han;
      if (quyen_han && typeof quyen_han === 'object' && !Array.isArray(quyen_han)) {
        normalizedQuyenHan = Object.values(quyen_han);
      }

      const updated = await rolesRepo.update(id, { ten_vt, mo_ta, quyen_han: normalizedQuyenHan });

      invalidateRoleCache(ten_vt || updated.ten_vt);

      // Return with normalized quyen_han
      if (updated.quyen_han && typeof updated.quyen_han === 'object' && !Array.isArray(updated.quyen_han)) {
        updated.quyen_han = Object.values(updated.quyen_han);
      }

      return updated;
    } catch (error) {
      logError('Error updating role', error);
      throw error;
    }
  }

  /**
   * Delete role
   * @param {string} roleId - Role ID
   * @param {Object} options - Deletion options
   * @returns {Promise<boolean>} Success status
   */
  static async delete(roleId, options = {}) {
    try {
      const { reassignTo, cascadeUsers } = options;

      logInfo('Deleting role', { roleId, reassignTo, cascadeUsers });

      // Check users referencing this role
      const usersCount = await rolesRepo.countUsersWithRole(roleId);

      if (usersCount > 0 && !reassignTo && !cascadeUsers) {
        const error = new Error('ROLE_IN_USE');
        error.usersCount = usersCount;
        throw error;
      }

      // If reassignTo provided, validate and reassign users first
      if (usersCount > 0 && reassignTo) {
        const target = await rolesRepo.findById(String(reassignTo));
        if (!target) {
          throw new Error('REASSIGN_ROLE_NOT_FOUND');
        }
        await rolesRepo.reassignUsers(roleId, String(reassignTo));
      }

      // Cascade delete users if requested
      if (usersCount > 0 && String(cascadeUsers) === 'true') {
        await this._cascadeDeleteUsers(roleId);
      }

      const removed = await rolesRepo.delete(roleId);
      invalidateRoleCache(removed?.ten_vt);

      return true;
    } catch (error) {
      logError('Error deleting role', error);
      throw error;
    }
  }

  /**
   * Cascade delete users with a role
   * @param {string} roleId - Role ID
   * @private
   */
  static async _cascadeDeleteUsers(roleId) {
    // Collect affected user ids
    const users = await rolesRepo.findUsersWithRole(roleId);
    const userIds = users.map(u => u.id);

    // Guard: cannot delete users who are class homeroom (chu_nhiem)
    const lopChuNhiemCount = await rolesRepo.countClassesWithHomeroom(userIds);
    
    if (lopChuNhiemCount > 0) {
      throw new Error('USERS_ARE_CLASS_HOMEROOM');
    }

    // Find student profiles linked to those users
    const students = await rolesRepo.findStudentsByUserIds(userIds);
    const studentIds = students.map(s => s.id);

    // Find activities created by those users
    const activities = await rolesRepo.findActivitiesByCreators(userIds);
    const activityIds = activities.map(a => a.id);

    await rolesRepo.cascadeDeleteUsers(userIds, studentIds, activityIds);
  }

  /**
   * Assign role to users
   * @param {string} roleId - Role ID
   * @param {Array<string>} userIds - Array of user IDs
   * @param {string} adminId - Admin user ID
   * @returns {Promise<Object>} Update count
   */
  static async assignToUsers(roleId, userIds, adminId) {
    try {
      if (!Array.isArray(userIds) || userIds.length === 0) {
        throw new Error('INVALID_USER_IDS');
      }

      logInfo('Assigning role to users', { roleId, userCount: userIds.length, adminId });

      // Verify role exists
      const role = await rolesRepo.findById(roleId);
      if (!role) {
        throw new Error('ROLE_NOT_FOUND');
      }

      // Update users with new role
      const count = await rolesRepo.assignRoleToUsers(roleId, userIds);

      logInfo('Role assigned to users', { adminId, roleId, userCount: count });

      return { count };
    } catch (error) {
      logError('Error assigning role to users', error);
      throw error;
    }
  }

  /**
   * Remove role from user (not implemented - users must have a role)
   * @param {string} userId - User ID
   * @returns {Promise<void>}
   */
  static async removeFromUser(userId) {
    // Don't allow removing role from user - they must have a role
    throw new Error('CANNOT_REMOVE_ROLE');
  }
}

module.exports = RolesService;





