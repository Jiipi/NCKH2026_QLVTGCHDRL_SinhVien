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

    // Log input data để debug
    console.log('[UpdateRole] Input data:', {
      id,
      ten_vt,
      quyen_han_type: typeof quyen_han,
      quyen_han_isArray: Array.isArray(quyen_han),
      quyen_han_length: Array.isArray(quyen_han) ? quyen_han.length : 'N/A',
      quyen_han_sample: Array.isArray(quyen_han) ? quyen_han.slice(0, 5) : quyen_han
    });

    // Ensure quyen_han is an array
    let normalizedQuyenHan = quyen_han;
    if (quyen_han && typeof quyen_han === 'object' && !Array.isArray(quyen_han)) {
      normalizedQuyenHan = Object.values(quyen_han);
      console.log('[UpdateRole] Normalized from object to array:', normalizedQuyenHan.length);
    }

    // Log normalized data
    console.log('[UpdateRole] Normalized quyen_han:', {
      type: typeof normalizedQuyenHan,
      isArray: Array.isArray(normalizedQuyenHan),
      length: Array.isArray(normalizedQuyenHan) ? normalizedQuyenHan.length : 'N/A',
      hasAttendanceWrite: Array.isArray(normalizedQuyenHan) ? normalizedQuyenHan.includes('attendance.write') : false
    });

    const updated = await this.roleRepository.update(id, { ten_vt, mo_ta, quyen_han: normalizedQuyenHan });
    
    // Log result
    console.log('[UpdateRole] Updated result:', {
      id: updated.id,
      ten_vt: updated.ten_vt,
      quyen_han_type: typeof updated.quyen_han,
      quyen_han_isArray: Array.isArray(updated.quyen_han),
      quyen_han_length: Array.isArray(updated.quyen_han) ? updated.quyen_han.length : 'N/A',
      hasAttendanceWrite: Array.isArray(updated.quyen_han) ? updated.quyen_han.includes('attendance.write') : false
    });

    invalidateRoleCache(ten_vt || updated.ten_vt);

    // Return with normalized quyen_han
    if (updated.quyen_han && typeof updated.quyen_han === 'object' && !Array.isArray(updated.quyen_han)) {
      updated.quyen_han = Object.values(updated.quyen_han);
    }

    return updated;
  }
}

module.exports = UpdateRoleUseCase;

