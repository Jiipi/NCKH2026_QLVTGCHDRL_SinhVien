/**
 * GetCurrentSemesterStatusUseCase
 * Use case for retrieving current semester status with class context
 * Follows Single Responsibility Principle (SRP)
 */

import type { Lop, SinhVien } from '@prisma/client';
import type GetCurrentSemesterUseCase from './GetCurrentSemesterUseCase';

const SemesterClosure = require('../../../../business/services/semesterClosure.service');
const { prisma } = require('../../../../data/infrastructure/prisma/client');
const { parseSemesterString, normalizeSemesterFormat } = require('../../../../core/utils/semester');

interface SemesterInfo {
  semester: string;
  year: number;
}

interface SemesterState {
  state: string;
  lock_level: string | null;
  proposed_by: string | null;
  approved_by: string | null;
  closed_by: string | null;
  closed_at: string | null;
  grace_until: string | null;
  version: number;
  snapshot_checksum: string | null;
}

interface StatusResult {
  semInfo?: SemesterInfo;
  state?: SemesterState;
}

interface ClassMonitor {
  lop_id?: string;
  [key: string]: unknown;
}

export interface CurrentSemesterStatusResponse {
  classId: string | null;
  semester: SemesterInfo | null;
  state: SemesterState;
}

class GetCurrentSemesterStatusUseCase {
  private getCurrentSemesterUseCase: GetCurrentSemesterUseCase;

  constructor(getCurrentSemesterUseCase: GetCurrentSemesterUseCase) {
    this.getCurrentSemesterUseCase = getCurrentSemesterUseCase;
  }

  /**
   * Execute use case
   * @param classId - Optional class ID
   * @param userId - Optional user ID to derive class from
   * @param classMonitor - Optional class monitor object with lop_id
   * @param semesterQuery - Optional semester string from query param
   * @returns Current semester status
   */
  async execute(
    classId: string | null = null, 
    userId: string | null = null, 
    classMonitor: ClassMonitor | null = null, 
    semesterQuery: string | null = null
  ): Promise<CurrentSemesterStatusResponse> {
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
          }) as Pick<Lop, 'id'> | null;
          if (classAsMonitor?.id) {
            classId = classAsMonitor.id;
          } else {
            // Fallback: find class from sinh_vien table
            const student = await prisma.sinhVien.findFirst({
              where: { nguoi_dung_id: userId },
              select: { lop_id: true }
            }) as Pick<SinhVien, 'lop_id'> | null;
            if (student?.lop_id) {
              classId = student.lop_id;
            }
          }
        }
      }
      
      // Parse semester from query or use current
      let semesterInfo: SemesterInfo | null = null;
      if (semesterQuery) {
        // Normalize and parse semester string (handles both hoc_ky_1-2025 and hoc_ky_1_2025)
        const normalized = normalizeSemesterFormat(semesterQuery);
        semesterInfo = parseSemesterString(normalized || semesterQuery) as SemesterInfo | null;
      }
      
      // Fallback to current semester if not provided or invalid
      if (!semesterInfo || !semesterInfo.semester || !semesterInfo.year) {
        const current = await this.getCurrentSemesterUseCase.execute();
        semesterInfo = current as SemesterInfo | null;
      }
      
      const semesterStr = semesterInfo ? `${semesterInfo.semester}-${semesterInfo.year}` : null;
      
      if (classId && semesterStr) {
        // Wrap getStatus in try-catch to handle file system errors
        let statusResult: StatusResult;
        try {
          statusResult = SemesterClosure.getStatus(classId, semesterStr) as StatusResult;
        } catch (statusError) {
          console.error('[GetCurrentSemesterStatus] Error getting status:', (statusError as Error).message);
          statusResult = { semInfo: semesterInfo ?? undefined, state: undefined };
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

export default GetCurrentSemesterStatusUseCase;
module.exports = GetCurrentSemesterStatusUseCase;
