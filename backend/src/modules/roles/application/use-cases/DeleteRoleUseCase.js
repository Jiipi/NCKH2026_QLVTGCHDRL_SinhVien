const { ValidationError, NotFoundError } = require('../../../../core/errors/AppError');
const { logInfo } = require('../../../../core/logger');

// Mock cache invalidation functions
const invalidateRoleCache = (roleName) => {
  logInfo('Cache invalidation skipped (no cache)', { roleName });
};

/**
 * DeleteRoleUseCase
 * Use case for deleting role
 * Follows Single Responsibility Principle (SRP)
 */
class DeleteRoleUseCase {
  constructor(roleRepository) {
    this.roleRepository = roleRepository;
  }

  async execute(roleId, options = {}) {
    const { reassignTo, cascadeUsers } = options;

    logInfo('Deleting role', { roleId, reassignTo, cascadeUsers });

    // Check users referencing this role
    const usersCount = await this.roleRepository.countUsersWithRole(roleId);

    if (usersCount > 0 && !reassignTo && !cascadeUsers) {
      const error = new ValidationError('Vai trò đang được sử dụng');
      error.usersCount = usersCount;
      throw error;
    }

    // If reassignTo provided, validate and reassign users first
    if (usersCount > 0 && reassignTo) {
      const target = await this.roleRepository.findById(String(reassignTo));
      if (!target) {
        throw new NotFoundError('Vai trò đích không tồn tại');
      }
      await this.roleRepository.reassignUsers(roleId, String(reassignTo));
    }

    // Cascade delete users if requested
    if (usersCount > 0 && String(cascadeUsers) === 'true') {
      await this._cascadeDeleteUsers(roleId);
    }

    const removed = await this.roleRepository.delete(roleId);
    invalidateRoleCache(removed?.ten_vt);

    return true;
  }

  async _cascadeDeleteUsers(roleId) {
    // Collect affected user ids
    const users = await this.roleRepository.findUsersWithRole(roleId);
    const userIds = users.map(u => u.id);

    // Guard: cannot delete users who are class homeroom (chu_nhiem)
    const lopChuNhiemCount = await this.roleRepository.countClassesWithHomeroom(userIds);
    
    if (lopChuNhiemCount > 0) {
      throw new ValidationError('Không thể xóa vì còn người dùng đang là chủ nhiệm lớp');
    }

    // Find student profiles linked to those users
    const students = await this.roleRepository.findStudentsByUserIds(userIds);
    const studentIds = students.map(s => s.id);

    // Find activities created by those users
    const activities = await this.roleRepository.findActivitiesByCreators(userIds);
    const activityIds = activities.map(a => a.id);

    await this.roleRepository.cascadeDeleteUsers(userIds, studentIds, activityIds);
  }
}

module.exports = DeleteRoleUseCase;

