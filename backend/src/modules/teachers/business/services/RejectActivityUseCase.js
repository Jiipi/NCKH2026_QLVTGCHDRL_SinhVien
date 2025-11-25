const { ForbiddenError } = require('../../../../core/errors/AppError');

/**
 * RejectActivityUseCase
 * Use case for rejecting activity
 * Follows Single Responsibility Principle (SRP)
 */
class RejectActivityUseCase {
  constructor(rejectActivityUseCase) {
    this.rejectActivityUseCase = rejectActivityUseCase;
  }

  async execute(activityId, reason, user) {
    if (user.role !== 'GIANG_VIEN') {
      throw new ForbiddenError('Chỉ giảng viên mới được từ chối hoạt động');
    }

    return await this.rejectActivityUseCase.execute(activityId, reason);
  }
}

module.exports = RejectActivityUseCase;

