import type { DangKyHoatDong, SinhVien, HoatDong, Lop, TrangThaiDangKy } from '@prisma/client';
import type IMonitorRepository from '../interfaces/IMonitorRepository';
import type { StudentWithRelations, ActivityFilter } from '../interfaces/IMonitorRepository';

import { logInfo, logError } from '../../../../core/logger';

/**
 * GetPendingRegistrationsCountUseCase
 * Use case for getting pending registrations count
 * Follows Single Responsibility Principle (SRP)
 */
class GetPendingRegistrationsCountUseCase {
  private monitorRepository: IMonitorRepository;

  constructor(monitorRepository: IMonitorRepository) {
    this.monitorRepository = monitorRepository;
  }

  async execute(classId: string): Promise<number> {
    try {
      const classStudents = await this.monitorRepository.findAllStudentsInClass(classId);
      const classCreatorUserIds: string[] = classStudents.map((s: StudentWithRelations) => s.nguoi_dung_id).filter(Boolean) as string[];
      
      const lop = await this.monitorRepository.findClassById(classId);
      if (lop?.chu_nhiem) {
        classCreatorUserIds.push(lop.chu_nhiem);
      }
      
      const activityFilter: ActivityFilter = {
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

export default GetPendingRegistrationsCountUseCase;
