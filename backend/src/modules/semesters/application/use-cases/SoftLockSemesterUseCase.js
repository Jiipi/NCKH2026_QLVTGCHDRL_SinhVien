/**
 * SoftLockSemesterUseCase
 * Use case for soft locking a semester
 * Follows Single Responsibility Principle (SRP)
 */

const SemesterClosure = require('../../../../services/semesterClosure.service');
const { logInfo } = require('../../../../core/logger');

class SoftLockSemesterUseCase {
  /**
   * Execute use case
   * @param {string} classId - Class ID
   * @param {string} actorId - User ID performing lock
   * @param {string} semesterStr - Semester string (e.g., 'hoc_ky_1-2025')
   * @param {number} graceHours - Grace period in hours (default: 72)
   * @returns {Promise<Object>} Lock state
   */
  async execute(classId, actorId, semesterStr, graceHours = 72) {
    const state = await SemesterClosure.softLock({ 
      classId, 
      actorId, 
      semesterStr, 
      graceHours 
    });
    
    logInfo('Semester soft locked', { classId, semesterStr, graceHours });
    return state;
  }
}

module.exports = SoftLockSemesterUseCase;

