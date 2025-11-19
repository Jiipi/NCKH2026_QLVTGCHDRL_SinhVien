/**
 * CheckClassMonitorUseCase
 * Use case for checking if user is class monitor
 * Follows Single Responsibility Principle (SRP)
 */
class CheckClassMonitorUseCase {
  constructor(profileRepository) {
    this.profileRepository = profileRepository;
  }

  async execute(userId) {
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
      classInfo: isMonitor ? student.lop_lop_truongTosinhVien : null
    };
  }
}

module.exports = CheckClassMonitorUseCase;

