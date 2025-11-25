/**
 * CheckClassHasMonitorUseCase
 * Use case for checking if a class has a monitor
 * Follows Single Responsibility Principle (SRP)
 */
class CheckClassHasMonitorUseCase {
  constructor(profileRepository) {
    this.profileRepository = profileRepository;
  }

  async execute(lopId) {
    const classData = await this.profileRepository.findClassWithMonitor(lopId);
    
    if (!classData) {
      return {
        hasMonitor: false,
        monitor: null
      };
    }

    const hasMonitor = classData.sinh_viens && classData.sinh_viens.length > 0;
    const monitor = hasMonitor ? classData.sinh_viens[0] : null;

    return {
      hasMonitor,
      monitor: monitor ? {
        id: monitor.id,
        name: monitor.nguoi_dung?.ho_ten || null
      } : null
    };
  }
}

module.exports = CheckClassHasMonitorUseCase;

