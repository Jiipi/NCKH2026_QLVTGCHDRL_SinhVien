/**
 * GetCurrentSemesterStatusUseCase
 * Use case for retrieving current semester status with class context
 * Follows Single Responsibility Principle (SRP)
 */

const SemesterClosure = require('../../../../business/services/semesterClosure.service');
const { prisma } = require('../../../../data/infrastructure/prisma/client');

class GetCurrentSemesterStatusUseCase {
  constructor(getCurrentSemesterUseCase) {
    this.getCurrentSemesterUseCase = getCurrentSemesterUseCase;
  }

  /**
   * Execute use case
   * @param {string|null} classId - Optional class ID
   * @param {string|null} userId - Optional user ID to derive class from
   * @param {Object|null} classMonitor - Optional class monitor object with lop_id
   * @returns {Promise<Object>} Current semester status
   */
  async execute(classId = null, userId = null, classMonitor = null) {
    // Derive classId from user if not provided
    if (!classId && userId) {
      if (classMonitor?.lop_id) {
        classId = classMonitor.lop_id;
      } else {
        const student = await prisma.sinhVien.findFirst({
          where: { nguoi_dung_id: userId },
          select: { lop_id: true }
        });
        if (student?.lop_id) {
          classId = student.lop_id;
        }
      }
    }
    
    const current = await this.getCurrentSemesterUseCase.execute();
    const semesterStr = current ? `${current.semester}-${current.year}` : null;
    
    if (classId && semesterStr) {
      const statusResult = SemesterClosure.getStatus(classId, semesterStr);
      return {
        classId: classId,
        semester: statusResult.semInfo || current,
        state: statusResult.state || {
          state: 'ACTIVE',
          lock_level: null,
          proposed_by: null,
          approved_by: null,
          closed_by: null,
          closed_at: null,
          grace_until: null,
          version: 1,
          snapshot_checksum: null
        }
      };
    }
    
    return {
      classId: null,
      semester: current,
      state: {
        state: 'ACTIVE',
        lock_level: null,
        proposed_by: null,
        approved_by: null,
        closed_by: null,
        closed_at: null,
        grace_until: null,
        version: 1,
        snapshot_checksum: null
      }
    };
  }
}

module.exports = GetCurrentSemesterStatusUseCase;

