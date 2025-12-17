/**
 * RollbackSemesterUseCase
 * Use case for rolling back semester closure
 * Follows Single Responsibility Principle (SRP)
 */

import SemesterClosure from '../../../../business/services/semesterClosure.service';
import { logInfo } from '../../../../core/logger';

interface RollbackResult {
  state: 'ACTIVE' | string;
  lock_level: null;
  grace_until: null;
  version: number;
}

class RollbackSemesterUseCase {
  /**
   * Execute use case
   * @param classId - Class ID
   * @param actorId - User ID performing rollback
   * @param semesterStr - Semester string (e.g., 'hoc_ky_1-2025')
   * @returns Rollback state
   */
  async execute(classId: string, actorId: string, semesterStr: string): Promise<RollbackResult> {
    const state = await SemesterClosure.rollback({ 
      classId, 
      actorId: parseInt(actorId, 10) || 0, 
      semesterStr 
    });
    
    logInfo('Semester closure rolled back', { classId, semesterStr });
    return state as RollbackResult;
  }
}

export default RollbackSemesterUseCase;
module.exports = RollbackSemesterUseCase;
