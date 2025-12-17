/**
 * ApproveActivityUseCase
 * Use case for approving activity
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
 * Interface for the underlying approve activity use case
 */
interface IApproveActivityUseCase {
  execute(activityId: string): Promise<unknown>;
}

/**
 * ApproveActivityUseCase
 * Use case for approving activity
 */
class ApproveActivityUseCase {
  private approveActivityUseCase: IApproveActivityUseCase;

  constructor(approveActivityUseCase: IApproveActivityUseCase) {
    this.approveActivityUseCase = approveActivityUseCase;
  }

  async execute(activityId: string, user: AuthUser): Promise<unknown> {
    if (user.role !== 'GIANG_VIEN') {
      throw new ForbiddenError('Chỉ giảng viên mới được duyệt hoạt động');
    }

    return await this.approveActivityUseCase.execute(activityId);
  }
}

export default ApproveActivityUseCase;
module.exports = ApproveActivityUseCase;
