const { logInfo, logError } = require('../../../../core/logger');

/**
 * GetPendingRegistrationsCountUseCase
 * Use case for getting pending registrations count
 * Follows Single Responsibility Principle (SRP)
 */
class GetPendingRegistrationsCountUseCase {
  constructor(monitorRepository) {
    this.monitorRepository = monitorRepository;
  }

  async execute(classId) {
    try {
      const classStudents = await this.monitorRepository.findAllStudentsInClass(classId);
      const classCreatorUserIds = classStudents.map(s => s.nguoi_dung_id).filter(Boolean);
      
      const lop = await this.monitorRepository.findClassById(classId);
      if (lop?.chu_nhiem) {
        classCreatorUserIds.push(lop.chu_nhiem);
      }
      
      const activityFilter = {
        nguoi_tao_id: { in: classCreatorUserIds }
      };
      
      const count = await this.monitorRepository.countRegistrations(classId, { 
        status: 'cho_duyet',
        activityFilter
      });
      
      return count;
    } catch (error) {
      logError('Error getting pending registrations count', error);
      throw error;
    }
  }
}

module.exports = GetPendingRegistrationsCountUseCase;

