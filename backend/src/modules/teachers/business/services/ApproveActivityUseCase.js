const { ForbiddenError } = require('../../../../core/errors/AppError');

/**
 * ApproveActivityUseCase
 * Use case for approving activity
 * Follows Single Responsibility Principle (SRP)
 */
class ApproveActivityUseCase {
  constructor(approveActivityUseCase) {
    this.approveActivityUseCase = approveActivityUseCase;
  }

  async execute(activityId, user) {
    if (user.role !== 'GIANG_VIEN') {
      throw new ForbiddenError('Chỉ giảng viên mới được duyệt hoạt động');
    }

    return await this.approveActivityUseCase.execute(activityId);
  }
}

module.exports = ApproveActivityUseCase;

