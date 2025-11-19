const { ForbiddenError } = require('../../../../core/errors/AppError');
const registrationsService = require('../../../registrations/registrations.service');

/**
 * ApproveRegistrationUseCase
 * Use case for approving registration
 * Follows Single Responsibility Principle (SRP)
 */
class ApproveRegistrationUseCase {
  async execute(regId, user) {
    if (user.role !== 'GIANG_VIEN') {
      throw new ForbiddenError('Chỉ giảng viên mới được duyệt đăng ký');
    }

    return await registrationsService.approve(regId, user);
  }
}

module.exports = ApproveRegistrationUseCase;

