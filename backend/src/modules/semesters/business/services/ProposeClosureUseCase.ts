/**
 * ProposeClosureUseCase
 * Use case for proposing semester closure
 * Follows Single Responsibility Principle (SRP)
 */

import SemesterClosure from '../../../../business/services/semesterClosure.service';
import { logInfo } from '../../../../core/logger';

interface ProposeClosureResult {
  state: 'CLOSING' | string;
  proposed_by?: number | null;
  version: number;
}

class ProposeClosureUseCase {
  /**
   * Execute use case
   * @param classId - Class ID
   * @param actorId - User ID proposing closure
   * @param semesterStr - Semester string (e.g., 'hoc_ky_1-2025')
   * @returns Closure state
   */
  async execute(classId: string, actorId: string, semesterStr: string): Promise<ProposeClosureResult> {
    const state = await SemesterClosure.proposeClose({ 
      classId, 
      actorId: parseInt(actorId, 10) || 0, 
      semesterStr 
    });
    
    logInfo('Semester closure proposed', { classId, semesterStr, actorId });
    return state as ProposeClosureResult;
  }
}

export default ProposeClosureUseCase;
module.exports = ProposeClosureUseCase;
