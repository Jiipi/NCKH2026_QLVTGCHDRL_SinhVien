/**
 * RejectActivityUseCase
 * Use case for rejecting activity
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
 * Interface for the underlying reject activity use case
 */
interface IRejectActivityUseCase {
  execute(activityId: string, reason: string, semesterInfo?: { hoc_ky: string; nam_hoc: string }): Promise<unknown>;
}

/**
 * RejectActivityUseCase
 * Use case for rejecting activity
 */
class RejectActivityUseCase {
  private rejectActivityUseCase: IRejectActivityUseCase;

  constructor(rejectActivityUseCase: IRejectActivityUseCase) {
    this.rejectActivityUseCase = rejectActivityUseCase;
  }

  async execute(activityId: string, reason: string, user: AuthUser, semesterInfo?: { hoc_ky: string; nam_hoc: string }): Promise<unknown> {
    if (user.role !== 'GIANG_VIEN') {
      throw new ForbiddenError('Chỉ giảng viên mới được từ chối hoạt động');
    }

    return await this.rejectActivityUseCase.execute(activityId, reason, semesterInfo);
  }
}

export default RejectActivityUseCase;
module.exports = RejectActivityUseCase;
