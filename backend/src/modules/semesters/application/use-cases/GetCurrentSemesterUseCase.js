const SemesterClosure = require('../../../../services/semesterClosure.service');

/**
 * GetCurrentSemesterUseCase
 * Use case for getting current semester info
 * Follows Single Responsibility Principle (SRP)
 */
class GetCurrentSemesterUseCase {
  async execute() {
    return SemesterClosure.getCurrentSemesterInfo();
  }
}

module.exports = GetCurrentSemesterUseCase;

