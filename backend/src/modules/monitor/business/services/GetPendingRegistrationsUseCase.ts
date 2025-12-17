import type { DangKyHoatDong, SinhVien, HoatDong, Lop, TrangThaiDangKy } from '@prisma/client';
import type IMonitorRepository from '../interfaces/IMonitorRepository';
import type { StudentWithRelations, RegistrationWithRelations, ActivityFilter } from '../interfaces/IMonitorRepository';

const { parseSemesterString } = require('../../../../core/utils/semester');
const { logInfo, logError } = require('../../../../core/logger');

/**
 * GetPendingRegistrationsUseCase
 * Use case for getting pending registrations for monitor's class
 * Follows Single Responsibility Principle (SRP)
 */
class GetPendingRegistrationsUseCase {
  private monitorRepository: IMonitorRepository;

  constructor(monitorRepository: IMonitorRepository) {
    this.monitorRepository = monitorRepository;
  }

  async execute(classId: string, status: string | null = null, semester: string | null = null): Promise<RegistrationWithRelations[]> {
    try {
      logInfo('Getting pending registrations', { classId, status, semester });

      let activityFilter: ActivityFilter = {};
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
      const classCreatorUserIds: string[] = classStudents.map((s: StudentWithRelations) => s.nguoi_dung_id).filter(Boolean) as string[];
      
      const lop = await this.monitorRepository.findClassById(classId);
      if (lop?.chu_nhiem) {
        classCreatorUserIds.push(lop.chu_nhiem);
      }
      
      const activityFilterWithClass: ActivityFilter = {
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

export default GetPendingRegistrationsUseCase;
module.exports = GetPendingRegistrationsUseCase;
