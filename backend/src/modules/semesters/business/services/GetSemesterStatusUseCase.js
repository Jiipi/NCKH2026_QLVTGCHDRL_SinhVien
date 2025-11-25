/**
 * GetSemesterStatusUseCase
 * Use case for retrieving semester status for a class
 * Follows Single Responsibility Principle (SRP)
 */

const SemesterClosure = require('../../../../business/services/semesterClosure.service');

class GetSemesterStatusUseCase {
  /**
   * Execute use case
   * @param {string} classId - Class ID
   * @param {string} semester - Semester string (e.g., 'hoc_ky_1-2025')
   * @returns {Object} Semester status
   */
  execute(classId, semester) {
    return SemesterClosure.getStatus(classId, semester);
  }
}

module.exports = GetSemesterStatusUseCase;

