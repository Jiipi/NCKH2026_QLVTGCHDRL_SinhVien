const { ForbiddenError } = require('../../../../core/errors/AppError');

/**
 * RejectRegistrationUseCase
 * Use case for rejecting registration
 * Follows Single Responsibility Principle (SRP)
 */
class RejectRegistrationUseCase {
  constructor(rejectRegistrationUseCase) {
    this.rejectRegistrationUseCase = rejectRegistrationUseCase;
  }

  async execute(regId, reason, user) {
    if (user.role !== 'GIANG_VIEN') {
      throw new ForbiddenError('Chỉ giảng viên mới được từ chối đăng ký');
    }

    return await this.rejectRegistrationUseCase.execute(regId, reason, user);
  }
}

module.exports = RejectRegistrationUseCase;

