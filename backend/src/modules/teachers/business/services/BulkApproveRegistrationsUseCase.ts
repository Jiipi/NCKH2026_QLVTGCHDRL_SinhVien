/**
 * BulkApproveRegistrationsUseCase
 * Use case for bulk approving registrations
 * Follows Single Responsibility Principle (SRP)
 */

import { ForbiddenError } from '../../../../core/errors/AppError';

/**
 * User object from JWT token
 */
interface AuthUser {
  sub?: string;
  id?: string;
  role: string;
}

/**
 * Interface for the underlying bulk approve registrations use case
 */
interface IBulkApproveRegistrationsUseCase {
  execute(regIds: string[], userSub: string): Promise<unknown>;
}

/**
 * BulkApproveRegistrationsUseCase
 * Use case for bulk approving registrations
 */
class BulkApproveRegistrationsUseCase {
  private bulkApproveRegistrationsUseCase: IBulkApproveRegistrationsUseCase;

  constructor(bulkApproveRegistrationsUseCase: IBulkApproveRegistrationsUseCase) {
    this.bulkApproveRegistrationsUseCase = bulkApproveRegistrationsUseCase;
  }

  async execute(regIds: string[], user: AuthUser): Promise<unknown> {
    if (user.role !== 'GIANG_VIEN') {
      throw new ForbiddenError('Chỉ giảng viên mới được duyệt đăng ký');
    }

    const userSub = user.sub || user.id;
    if (!userSub) {
      throw new ForbiddenError('Không xác định được người dùng');
    }

    return await this.bulkApproveRegistrationsUseCase.execute(regIds, userSub);
  }
}

export default BulkApproveRegistrationsUseCase;
module.exports = BulkApproveRegistrationsUseCase;
