/**
 * RejectRegistrationUseCase
 * Use case for rejecting registration
 * Follows Single Responsibility Principle (SRP)
 */

import { ForbiddenError } from '../../../../core/errors/AppError';

/**
 * User object from JWT token
 */
interface AuthUser {
  sub: string;
  id?: string;
  role: string;
}

/**
 * Interface for the underlying reject registration use case
 */
interface IRejectRegistrationUseCase {
  execute(regId: string, reason: string, user: AuthUser): Promise<unknown>;
}

/**
 * RejectRegistrationUseCase
 * Use case for rejecting registration
 */
class RejectRegistrationUseCase {
  private rejectRegistrationUseCase: IRejectRegistrationUseCase;

  constructor(rejectRegistrationUseCase: IRejectRegistrationUseCase) {
    this.rejectRegistrationUseCase = rejectRegistrationUseCase;
  }

  async execute(regId: string, reason: string, user: AuthUser): Promise<unknown> {
    if (user.role !== 'GIANG_VIEN') {
      throw new ForbiddenError('Chỉ giảng viên mới được từ chối đăng ký');
    }

    return await this.rejectRegistrationUseCase.execute(regId, reason, user);
  }
}

export default RejectRegistrationUseCase;
module.exports = RejectRegistrationUseCase;
