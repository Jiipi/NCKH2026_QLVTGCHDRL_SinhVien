const { ValidationError } = require('../../../../core/errors/AppError');
const CreateRoleDto = require('../dto/CreateRoleDto');
const { logInfo } = require('../../../../core/logger');

// Mock cache invalidation functions
const invalidateRoleCache = (roleName) => {
  logInfo('Cache invalidation skipped (no cache)', { roleName });
};

/**
 * CreateRoleUseCase
 * Use case for creating role
 * Follows Single Responsibility Principle (SRP)
 */
class CreateRoleUseCase {
  constructor(roleRepository) {
    this.roleRepository = roleRepository;
  }

  async execute(data, adminId) {
    const { ten_vt, mo_ta, quyen_han } = CreateRoleDto.fromRequest(data);

    logInfo('Creating role', { ten_vt, adminId });

    // Check if role already exists
    const exists = await this.roleRepository.findByName(ten_vt);
    if (exists) {
      throw new ValidationError('Vai trò đã tồn tại');
    }

    const item = await this.roleRepository.create({ ten_vt, mo_ta, quyen_han });

    logInfo('Role created', { adminId, roleId: item.id });
    invalidateRoleCache(ten_vt);

    return item;
  }
}

module.exports = CreateRoleUseCase;

