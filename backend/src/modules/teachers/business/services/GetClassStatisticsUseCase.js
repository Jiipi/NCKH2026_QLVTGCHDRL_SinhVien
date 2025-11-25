const { ForbiddenError } = require('../../../../core/errors/AppError');

/**
 * GetClassStatisticsUseCase
 * Use case for getting class statistics
 * Follows Single Responsibility Principle (SRP)
 */
class GetClassStatisticsUseCase {
  constructor(teacherRepository) {
    this.teacherRepository = teacherRepository;
  }

  async execute(className, semesterId, user) {
    if (user.role !== 'GIANG_VIEN') {
      throw new ForbiddenError('Chỉ giảng viên mới được xem thống kê');
    }

    const userId = user.sub || user.id;
    const hasAccess = await this.teacherRepository.hasAccessToClass(userId, className);
    if (!hasAccess) {
      throw new ForbiddenError('Bạn không có quyền xem lớp này');
    }

    return await this.teacherRepository.getClassStats(className, semesterId);
  }
}

module.exports = GetClassStatisticsUseCase;

