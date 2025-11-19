const { ForbiddenError } = require('../../../../core/errors/AppError');
const registrationsService = require('../../../registrations/registrations.service');

/**
 * BulkApproveRegistrationsUseCase
 * Use case for bulk approving registrations
 * Follows Single Responsibility Principle (SRP)
 */
class BulkApproveRegistrationsUseCase {
  async execute(regIds, user) {
    if (user.role !== 'GIANG_VIEN') {
      throw new ForbiddenError('Chỉ giảng viên mới được duyệt đăng ký');
    }

    return await registrationsService.bulkApprove(regIds, user);
  }
}

module.exports = BulkApproveRegistrationsUseCase;

