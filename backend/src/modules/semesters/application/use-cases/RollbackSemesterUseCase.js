/**
 * RollbackSemesterUseCase
 * Use case for rolling back semester closure
 * Follows Single Responsibility Principle (SRP)
 */

const SemesterClosure = require('../../../../services/semesterClosure.service');
const { logInfo } = require('../../../../core/logger');

class RollbackSemesterUseCase {
  /**
   * Execute use case
   * @param {string} classId - Class ID
   * @param {string} actorId - User ID performing rollback
   * @param {string} semesterStr - Semester string (e.g., 'hoc_ky_1-2025')
   * @returns {Promise<Object>} Rollback state
   */
  async execute(classId, actorId, semesterStr) {
    const state = await SemesterClosure.rollback({ 
      classId, 
      actorId, 
      semesterStr 
    });
    
    logInfo('Semester closure rolled back', { classId, semesterStr });
    return state;
  }
}

module.exports = RollbackSemesterUseCase;

