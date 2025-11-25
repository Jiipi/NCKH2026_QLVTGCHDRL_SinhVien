/**
 * ProposeClosureUseCase
 * Use case for proposing semester closure
 * Follows Single Responsibility Principle (SRP)
 */

const SemesterClosure = require('../../../../business/services/semesterClosure.service');
const { logInfo } = require('../../../../core/logger');

class ProposeClosureUseCase {
  /**
   * Execute use case
   * @param {string} classId - Class ID
   * @param {string} actorId - User ID proposing closure
   * @param {string} semesterStr - Semester string (e.g., 'hoc_ky_1-2025')
   * @returns {Promise<Object>} Closure state
   */
  async execute(classId, actorId, semesterStr) {
    const state = await SemesterClosure.proposeClose({ 
      classId, 
      actorId, 
      semesterStr 
    });
    
    logInfo('Semester closure proposed', { classId, semesterStr, actorId });
    return state;
  }
}

module.exports = ProposeClosureUseCase;

