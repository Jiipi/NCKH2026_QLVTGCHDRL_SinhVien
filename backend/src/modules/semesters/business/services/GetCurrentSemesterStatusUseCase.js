/**
 * GetCurrentSemesterStatusUseCase
 * Use case for retrieving current semester status with class context
 * Follows Single Responsibility Principle (SRP)
 */

const SemesterClosure = require('../../../../business/services/semesterClosure.service');
const { prisma } = require('../../../../data/infrastructure/prisma/client');
const { parseSemesterString, normalizeSemesterFormat } = require('../../../../core/utils/semester');

class GetCurrentSemesterStatusUseCase {
  constructor(getCurrentSemesterUseCase) {
    this.getCurrentSemesterUseCase = getCurrentSemesterUseCase;
  }

  /**
   * Execute use case
   * @param {string|null} classId - Optional class ID
   * @param {string|null} userId - Optional user ID to derive class from
   * @param {Object|null} classMonitor - Optional class monitor object with lop_id
   * @param {string|null} semesterQuery - Optional semester string from query param
   * @returns {Promise<Object>} Current semester status
   */
  async execute(classId = null, userId = null, classMonitor = null, semesterQuery = null) {
    try {
      // Derive classId from user if not provided
      if (!classId && userId) {
        if (classMonitor?.lop_id) {
          classId = classMonitor.lop_id;
        } else {
          // Try to find class where user is class monitor (LOP_TRUONG)
          const classAsMonitor = await prisma.lop.findFirst({
            where: {
              lop_truong_rel: {
                nguoi_dung_id: userId
              }
            },
            select: { id: true }
          });
          if (classAsMonitor?.id) {
            classId = classAsMonitor.id;
          } else {
            // Fallback: find class from sinh_vien table
            const student = await prisma.sinhVien.findFirst({
              where: { nguoi_dung_id: userId },
              select: { lop_id: true }
            });
            if (student?.lop_id) {
              classId = student.lop_id;
            }
          }
        }
      }
      
      // Parse semester from query or use current
      let semesterInfo;
      if (semesterQuery) {
        // Normalize and parse semester string (handles both hoc_ky_1-2025 and hoc_ky_1_2025)
        const normalized = normalizeSemesterFormat(semesterQuery);
        semesterInfo = parseSemesterString(normalized || semesterQuery);
      }
      
      // Fallback to current semester if not provided or invalid
      if (!semesterInfo || !semesterInfo.semester || !semesterInfo.year) {
        const current = await this.getCurrentSemesterUseCase.execute();
        semesterInfo = current;
      }
      
      const semesterStr = semesterInfo ? `${semesterInfo.semester}-${semesterInfo.year}` : null;
      
      if (classId && semesterStr) {
        // Wrap getStatus in try-catch to handle file system errors
        let statusResult;
        try {
          statusResult = SemesterClosure.getStatus(classId, semesterStr);
        } catch (statusError) {
          console.error('[GetCurrentSemesterStatus] Error getting status:', statusError.message);
          statusResult = { semInfo: semesterInfo, state: null };
        }
        
        return {
          classId: classId,
          semester: statusResult.semInfo || semesterInfo,
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
        semester: semesterInfo,
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
    } catch (error) {
      console.error('[GetCurrentSemesterStatus] Unexpected error:', error);
      // Return safe default instead of throwing
      return {
        classId: null,
        semester: null,
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
}

module.exports = GetCurrentSemesterStatusUseCase;

