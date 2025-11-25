/**
 * HardLockSemesterUseCase
 * Use case for hard locking a semester
 * Follows Single Responsibility Principle (SRP)
 */

const SemesterClosure = require('../../../../business/services/semesterClosure.service');
const { logInfo } = require('../../../../core/logger');

class HardLockSemesterUseCase {
  /**
   * Execute use case
   * @param {string} classId - Class ID
   * @param {string} actorId - User ID performing lock
   * @param {string} semesterStr - Semester string (e.g., 'hoc_ky_1-2025')
   * @returns {Promise<Object>} Lock state
   */
  async execute(classId, actorId, semesterStr) {
    const state = await SemesterClosure.hardLock({ 
      classId, 
      actorId, 
      semesterStr 
    });
    
    logInfo('Semester hard locked', { classId, semesterStr });
    return state;
  }
}

module.exports = HardLockSemesterUseCase;

