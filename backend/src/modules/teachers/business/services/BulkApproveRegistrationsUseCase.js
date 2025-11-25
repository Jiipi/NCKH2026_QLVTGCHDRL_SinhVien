const { ForbiddenError } = require('../../../../core/errors/AppError');

/**
 * BulkApproveRegistrationsUseCase
 * Use case for bulk approving registrations
 * Follows Single Responsibility Principle (SRP)
 */
class BulkApproveRegistrationsUseCase {
  constructor(bulkApproveRegistrationsUseCase) {
    this.bulkApproveRegistrationsUseCase = bulkApproveRegistrationsUseCase;
  }

  async execute(regIds, user) {
    if (user.role !== 'GIANG_VIEN') {
      throw new ForbiddenError('Chỉ giảng viên mới được duyệt đăng ký');
    }

    const userSub = user.sub || user.id;
    return await this.bulkApproveRegistrationsUseCase.execute(regIds, userSub);
  }
}

module.exports = BulkApproveRegistrationsUseCase;

