/**
 * SoftLockSemesterUseCase
 * Use case for soft locking a semester
 * Follows Single Responsibility Principle (SRP)
 */

import SemesterClosure from '../../../../business/services/semesterClosure.service';
import { logInfo } from '../../../../core/logger';

interface SoftLockResult {
  state: 'LOCKED_SOFT' | string;
  lock_level: 'SOFT' | string | null;
  grace_until?: string | null;
  version: number;
}

class SoftLockSemesterUseCase {
  /**
   * Execute use case
   * @param classId - Class ID
   * @param actorId - User ID performing lock
   * @param semesterStr - Semester string (e.g., 'hoc_ky_1-2025')
   * @param graceHours - Grace period in hours (default: 72)
   * @returns Lock state
   */
  async execute(
    classId: string, 
    actorId: string, 
    semesterStr: string, 
    graceHours: number = 72
  ): Promise<SoftLockResult> {
    const state = await SemesterClosure.softLock({ 
      classId, 
      actorId: parseInt(actorId, 10) || 0, 
      semesterStr, 
      graceHours 
    });
    
    logInfo('Semester soft locked', { classId, semesterStr, graceHours });
    return state as SoftLockResult;
  }
}

export default SoftLockSemesterUseCase;
module.exports = SoftLockSemesterUseCase;
