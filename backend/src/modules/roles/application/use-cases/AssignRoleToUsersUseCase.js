const { ValidationError, NotFoundError } = require('../../../../core/errors/AppError');
const { logInfo } = require('../../../../core/logger');

/**
 * AssignRoleToUsersUseCase
 * Use case for assigning role to users
 * Follows Single Responsibility Principle (SRP)
 */
class AssignRoleToUsersUseCase {
  constructor(roleRepository) {
    this.roleRepository = roleRepository;
  }

  async execute(roleId, userIds, adminId) {
    if (!Array.isArray(userIds) || userIds.length === 0) {
      throw new ValidationError('Danh sách người dùng không hợp lệ');
    }

    logInfo('Assigning role to users', { roleId, userCount: userIds.length, adminId });

    // Verify role exists
    const role = await this.roleRepository.findById(roleId);
    if (!role) {
      throw new NotFoundError('Không tìm thấy vai trò');
    }

    // Update users with new role
    const count = await this.roleRepository.assignRoleToUsers(roleId, userIds);

    logInfo('Role assigned to users', { adminId, roleId, userCount: count.count });

    return { count: count.count };
  }
}

module.exports = AssignRoleToUsersUseCase;

