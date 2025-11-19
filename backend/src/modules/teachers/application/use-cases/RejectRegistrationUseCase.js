const { ForbiddenError } = require('../../../../core/errors/AppError');
const registrationsService = require('../../../registrations/registrations.service');

/**
 * RejectRegistrationUseCase
 * Use case for rejecting registration
 * Follows Single Responsibility Principle (SRP)
 */
class RejectRegistrationUseCase {
  async execute(regId, reason, user) {
    if (user.role !== 'GIANG_VIEN') {
      throw new ForbiddenError('Chỉ giảng viên mới được từ chối đăng ký');
    }

    return await registrationsService.reject(regId, reason, user);
  }
}

module.exports = RejectRegistrationUseCase;

