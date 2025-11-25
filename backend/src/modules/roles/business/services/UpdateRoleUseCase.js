const { logInfo } = require('../../../../core/logger');

// Mock cache invalidation functions
const invalidateRoleCache = (roleName) => {
  logInfo('Cache invalidation skipped (no cache)', { roleName });
};

/**
 * UpdateRoleUseCase
 * Use case for updating role
 * Follows Single Responsibility Principle (SRP)
 */
class UpdateRoleUseCase {
  constructor(roleRepository) {
    this.roleRepository = roleRepository;
  }

  async execute(id, data) {
    const { ten_vt, mo_ta, quyen_han } = data;

    logInfo('Updating role', { id, ten_vt });

    // Ensure quyen_han is an array
    let normalizedQuyenHan = quyen_han;
    if (quyen_han && typeof quyen_han === 'object' && !Array.isArray(quyen_han)) {
      normalizedQuyenHan = Object.values(quyen_han).filter(p => typeof p === 'string');
    }
    
    // Đảm bảo là array hoặc null
    if (normalizedQuyenHan !== null && normalizedQuyenHan !== undefined && !Array.isArray(normalizedQuyenHan)) {
      normalizedQuyenHan = [];
    }

    const updated = await this.roleRepository.update(id, { ten_vt, mo_ta, quyen_han: normalizedQuyenHan });
    
    invalidateRoleCache(ten_vt || updated.ten_vt);

    // Return with normalized quyen_han
    if (updated.quyen_han && typeof updated.quyen_han === 'object' && !Array.isArray(updated.quyen_han)) {
      updated.quyen_han = Object.values(updated.quyen_han).filter(p => typeof p === 'string');
    }
    
    // Đảm bảo response có quyen_han là array
    if (updated.quyen_han && !Array.isArray(updated.quyen_han)) {
      updated.quyen_han = [];
    }

    return updated;
  }
}

module.exports = UpdateRoleUseCase;

