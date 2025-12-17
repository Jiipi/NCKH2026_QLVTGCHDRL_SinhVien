import { ValidationError, NotFoundError } from '../../../../core/errors/AppError';
import { logInfo } from '../../../../core/logger';
import type IRoleRepository from '../interfaces/IRoleRepository';
import type { BatchUpdateResult } from '../interfaces/IRoleRepository';

/**
 * AssignRoleToUsersUseCase
 * Use case for assigning role to users
 * Follows Single Responsibility Principle (SRP)
 */
class AssignRoleToUsersUseCase {
  private roleRepository: IRoleRepository;

  constructor(roleRepository: IRoleRepository) {
    this.roleRepository = roleRepository;
  }

  async execute(roleId: string, userIds: string[], adminId: string): Promise<{ count: number }> {
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
    const count: BatchUpdateResult = await this.roleRepository.assignRoleToUsers(roleId, userIds);

    logInfo('Role assigned to users', { adminId, roleId, userCount: count.count });

    return { count: count.count };
  }
}

export default AssignRoleToUsersUseCase;
module.exports = AssignRoleToUsersUseCase;
