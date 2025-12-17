import { NotFoundError } from '../../../../core/errors/AppError';
import type IRoleRepository from '../interfaces/IRoleRepository';
import type { VaiTro } from '@prisma/client';

interface RoleWithNormalizedPermissions extends VaiTro {
  quyen_han: string[] | null;
}

/**
 * GetRoleByIdUseCase
 * Use case for getting role by ID
 * Follows Single Responsibility Principle (SRP)
 */
class GetRoleByIdUseCase {
  private roleRepository: IRoleRepository;

  constructor(roleRepository: IRoleRepository) {
    this.roleRepository = roleRepository;
  }

  async execute(id: string): Promise<RoleWithNormalizedPermissions> {
    const item = await this.roleRepository.findById(id);

    if (!item) {
      throw new NotFoundError('Không tìm thấy vai trò');
    }

    // Convert quyen_han from object to array if needed
    const result = item as RoleWithNormalizedPermissions;
    if (result.quyen_han && typeof result.quyen_han === 'object' && !Array.isArray(result.quyen_han)) {
      result.quyen_han = Object.values(result.quyen_han as Record<string, string>);
    }

    return result;
  }
}

export default GetRoleByIdUseCase;
module.exports = GetRoleByIdUseCase;
