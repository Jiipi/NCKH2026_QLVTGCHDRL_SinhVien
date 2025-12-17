import type IProfileRepository from '../interfaces/IProfileRepository';

/**
 * CheckClassHasMonitorUseCase
 * Use case for checking if a class has a monitor
 * Follows Single Responsibility Principle (SRP)
 */

export interface MonitorInfo {
  id: string;
  name: string | null;
}

export interface ClassMonitorResult {
  hasMonitor: boolean;
  monitor: MonitorInfo | null;
}

class CheckClassHasMonitorUseCase {
  private profileRepository: IProfileRepository;

  constructor(profileRepository: IProfileRepository) {
    this.profileRepository = profileRepository;
  }

  async execute(lopId: string): Promise<ClassMonitorResult> {
    const classData = await this.profileRepository.findClassWithMonitor(lopId);
    
    if (!classData) {
      return {
        hasMonitor: false,
        monitor: null
      };
    }

    const hasMonitor = classData.sinh_viens && classData.sinh_viens.length > 0;
    const monitor = hasMonitor ? classData.sinh_viens![0] : null;

    return {
      hasMonitor,
      monitor: monitor ? {
        id: monitor.id,
        name: monitor.nguoi_dung?.ho_ten || null
      } : null
    };
  }
}

export default CheckClassHasMonitorUseCase;
module.exports = CheckClassHasMonitorUseCase;
