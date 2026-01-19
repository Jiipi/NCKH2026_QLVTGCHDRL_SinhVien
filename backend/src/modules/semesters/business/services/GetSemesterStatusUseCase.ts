/**
 * GetSemesterStatusUseCase
 * Use case for retrieving semester status for a class
 * Follows Single Responsibility Principle (SRP)
 */

import { SemesterClosureService } from '../../../../business/services/semesterClosure.service';

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

interface SemesterInfo {
  semester: string;
  year: string;
}

export interface SemesterStatusResult {
  semInfo: SemesterInfo;
  state: SemesterState | { error: string };
}

class GetSemesterStatusUseCase {
  /**
   * Execute use case
   * @param classId - Class ID
   * @param semester - Semester string (e.g., 'hoc_ky_1-2025')
   * @returns Semester status
   */
  execute(classId: string, semester: string): SemesterStatusResult {
    return SemesterClosureService.getStatus(classId, semester) as SemesterStatusResult;
  }
}

export default GetSemesterStatusUseCase;
