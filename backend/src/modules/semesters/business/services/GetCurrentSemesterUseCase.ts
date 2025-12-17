/**
 * GetCurrentSemesterUseCase
 * Use case for getting current semester info
 * Follows Single Responsibility Principle (SRP)
 */

import { SemesterClosureService } from '../../../../business/services/semesterClosure.service';

export interface SemesterInfo {
  semester: string;
  year: string;
}

class GetCurrentSemesterUseCase {
  async execute(): Promise<SemesterInfo> {
    return SemesterClosureService.getCurrentSemesterInfo();
  }
}

export default GetCurrentSemesterUseCase;
