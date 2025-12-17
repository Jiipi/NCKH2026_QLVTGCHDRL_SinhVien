/**
 * GetCurrentSemesterUseCase
 * Use case for getting current semester info
 * Follows Single Responsibility Principle (SRP)
 */

const SemesterClosure = require('../../../../business/services/semesterClosure.service');

export interface SemesterInfo {
  semester: string;
  year: number;
}

class GetCurrentSemesterUseCase {
  async execute(): Promise<SemesterInfo> {
    return SemesterClosure.getCurrentSemesterInfo() as SemesterInfo;
  }
}

export default GetCurrentSemesterUseCase;
module.exports = GetCurrentSemesterUseCase;
