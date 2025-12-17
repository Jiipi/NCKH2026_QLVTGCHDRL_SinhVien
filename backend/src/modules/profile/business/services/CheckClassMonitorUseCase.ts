import type { Lop } from '@prisma/client';
import type IProfileRepository from '../interfaces/IProfileRepository';

/**
 * CheckClassMonitorUseCase
 * Use case for checking if user is class monitor
 * Follows Single Responsibility Principle (SRP)
 */

export interface MonitorStatusResult {
  isMonitor: boolean;
  classInfo: Lop | null;
}

class CheckClassMonitorUseCase {
  private profileRepository: IProfileRepository;

  constructor(profileRepository: IProfileRepository) {
    this.profileRepository = profileRepository;
  }

  async execute(userId: string): Promise<MonitorStatusResult> {
    const student = await this.profileRepository.findStudentWithMonitorInfo(userId);

    if (!student) {
      return {
        isMonitor: false,
        classInfo: null
      };
    }

    const isMonitor = student.lop_lop_truongTosinhVien !== null;

    return {
      isMonitor,
      classInfo: isMonitor ? student.lop_lop_truongTosinhVien! : null
    };
  }
}

export default CheckClassMonitorUseCase;
module.exports = CheckClassMonitorUseCase;
