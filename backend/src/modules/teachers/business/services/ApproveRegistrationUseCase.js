const { ForbiddenError } = require('../../../../core/errors/AppError');

/**
 * ApproveRegistrationUseCase
 * Use case for approving registration
 * Follows Single Responsibility Principle (SRP)
 */
class ApproveRegistrationUseCase {
  constructor(approveRegistrationUseCase) {
    this.approveRegistrationUseCase = approveRegistrationUseCase;
  }

  async execute(regId, user) {
    if (user.role !== 'GIANG_VIEN') {
      throw new ForbiddenError('Chỉ giảng viên mới được duyệt đăng ký');
    }

    return await this.approveRegistrationUseCase.execute(regId, user);
  }
}

module.exports = ApproveRegistrationUseCase;

