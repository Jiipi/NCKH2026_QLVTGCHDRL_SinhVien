const { parseSemesterString } = require('../../../../core/utils/semester');
const { logInfo, logError } = require('../../../../core/logger');

/**
 * GetPendingRegistrationsUseCase
 * Use case for getting pending registrations for monitor's class
 * Follows Single Responsibility Principle (SRP)
 */
class GetPendingRegistrationsUseCase {
  constructor(monitorRepository) {
    this.monitorRepository = monitorRepository;
  }

  async execute(classId, status = null, semester = null) {
    try {
      logInfo('Getting pending registrations', { classId, status, semester });

      let activityFilter = {};
      if (semester) {
        const parsed = parseSemesterString(semester);
        if (parsed && parsed.year) {
          activityFilter = {
            hoc_ky: parsed.semester,
            nam_hoc: parsed.year
          };
        }
      }
      
      const classStudents = await this.monitorRepository.findAllStudentsInClass(classId);
      const classCreatorUserIds = classStudents.map(s => s.nguoi_dung_id).filter(Boolean);
      
      const lop = await this.monitorRepository.findClassById(classId);
      if (lop?.chu_nhiem) {
        classCreatorUserIds.push(lop.chu_nhiem);
      }
      
      const activityFilterWithClass = {
        ...activityFilter,
        nguoi_tao_id: { in: classCreatorUserIds }
      };

      const registrations = await this.monitorRepository.findClassRegistrations(classId, {
        status,
        activityFilter: (activityFilterWithClass && Object.keys(activityFilterWithClass).length) ? activityFilterWithClass : {}
      });

      return registrations;
    } catch (error) {
      logError('Error getting pending registrations', error);
      throw error;
    }
  }
}

module.exports = GetPendingRegistrationsUseCase;

