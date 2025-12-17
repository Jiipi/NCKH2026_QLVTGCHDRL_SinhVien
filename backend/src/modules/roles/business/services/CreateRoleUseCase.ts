import { ValidationError } from '../../../../core/errors/AppError';
import CreateRoleDto from '../dto/CreateRoleDto';
import type { CreateRoleInput } from '../dto/CreateRoleDto';
import { logInfo } from '../../../../core/logger';
import type IRoleRepository from '../interfaces/IRoleRepository';
import type { VaiTro } from '@prisma/client';

// Mock cache invalidation functions
const invalidateRoleCache = (roleName: string | undefined): void => {
  logInfo('Cache invalidation skipped (no cache)', { roleName });
};

/**
 * CreateRoleUseCase
 * Use case for creating role
 * Follows Single Responsibility Principle (SRP)
 */
class CreateRoleUseCase {
  private roleRepository: IRoleRepository;

  constructor(roleRepository: IRoleRepository) {
    this.roleRepository = roleRepository;
  }

  async execute(data: CreateRoleInput, adminId: string): Promise<VaiTro> {
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

export default CreateRoleUseCase;
module.exports = CreateRoleUseCase;
