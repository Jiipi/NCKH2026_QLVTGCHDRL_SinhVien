/**
 * HardLockSemesterUseCase
 * Use case for hard locking a semester
 * Follows Single Responsibility Principle (SRP)
 */

import SemesterClosure from '../../../../business/services/semesterClosure.service';
import { logInfo } from '../../../../core/logger';

interface HardLockResult {
  state: 'LOCKED_HARD' | string;
  lock_level: 'HARD' | string | null;
  closed_by?: number | null;
  closed_at?: string | null;
  snapshot_checksum?: string | null;
  version: number;
}

class HardLockSemesterUseCase {
  /**
   * Execute use case
   * @param classId - Class ID
   * @param actorId - User ID performing lock
   * @param semesterStr - Semester string (e.g., 'hoc_ky_1-2025')
   * @returns Lock state
   */
  async execute(classId: string, actorId: string, semesterStr: string): Promise<HardLockResult> {
    const state = await SemesterClosure.hardLock({ 
      classId, 
      actorId: parseInt(actorId, 10) || 0, 
      semesterStr 
    });
    
    logInfo('Semester hard locked', { classId, semesterStr });
    return state as HardLockResult;
  }
}

export default HardLockSemesterUseCase;
module.exports = HardLockSemesterUseCase;
