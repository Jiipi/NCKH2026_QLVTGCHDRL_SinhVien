import { logInfo } from '../../../../core/logger';
import type IRoleRepository from '../interfaces/IRoleRepository';
import type { VaiTro } from '@prisma/client';

// Mock cache invalidation functions
const invalidateRoleCache = (roleName: string | undefined): void => {
  logInfo('Cache invalidation skipped (no cache)', { roleName });
};

export interface UpdateRoleData {
  ten_vt?: string;
  mo_ta?: string | null;
  quyen_han?: string[] | Record<string, unknown> | null;
}

interface RoleWithNormalizedPermissions extends VaiTro {
  quyen_han: string[] | null;
}

/**
 * UpdateRoleUseCase
 * Use case for updating role
 * Follows Single Responsibility Principle (SRP)
 */
class UpdateRoleUseCase {
  private roleRepository: IRoleRepository;

  constructor(roleRepository: IRoleRepository) {
    this.roleRepository = roleRepository;
  }

  async execute(id: string, data: UpdateRoleData): Promise<RoleWithNormalizedPermissions> {
    const { ten_vt, mo_ta, quyen_han } = data;

    logInfo('Updating role', { id, ten_vt });

    // Ensure quyen_han is an array
    let normalizedQuyenHan: string[] | null | undefined = quyen_han as string[] | null | undefined;
    if (quyen_han && typeof quyen_han === 'object' && !Array.isArray(quyen_han)) {
      normalizedQuyenHan = Object.values(quyen_han).filter((p): p is string => typeof p === 'string');
    }
    
    // Đảm bảo là array hoặc null
    if (normalizedQuyenHan !== null && normalizedQuyenHan !== undefined && !Array.isArray(normalizedQuyenHan)) {
      normalizedQuyenHan = [];
    }

    const updated = await this.roleRepository.update(id, { ten_vt, mo_ta, quyen_han: normalizedQuyenHan });
    
    invalidateRoleCache(ten_vt || updated.ten_vt);

    // Return with normalized quyen_han
    const result = updated as RoleWithNormalizedPermissions;
    if (result.quyen_han && typeof result.quyen_han === 'object' && !Array.isArray(result.quyen_han)) {
      result.quyen_han = Object.values(result.quyen_han as Record<string, string>).filter((p): p is string => typeof p === 'string');
    }
    
    // Đảm bảo response có quyen_han là array
    if (result.quyen_han && !Array.isArray(result.quyen_han)) {
      result.quyen_han = [];
    }

    return result;
  }
}

export default UpdateRoleUseCase;
module.exports = UpdateRoleUseCase;
