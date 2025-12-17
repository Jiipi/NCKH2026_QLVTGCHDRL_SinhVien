/**
 * ApproveRegistrationUseCase
 * Use case for approving registration
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
 * Interface for the underlying approve registration use case
 */
interface IApproveRegistrationUseCase {
  execute(regId: string, user: AuthUser): Promise<unknown>;
}

/**
 * ApproveRegistrationUseCase
 * Use case for approving registration
 */
class ApproveRegistrationUseCase {
  private approveRegistrationUseCase: IApproveRegistrationUseCase;

  constructor(approveRegistrationUseCase: IApproveRegistrationUseCase) {
    this.approveRegistrationUseCase = approveRegistrationUseCase;
  }

  async execute(regId: string, user: AuthUser): Promise<unknown> {
    if (user.role !== 'GIANG_VIEN') {
      throw new ForbiddenError('Chỉ giảng viên mới được duyệt đăng ký');
    }

    return await this.approveRegistrationUseCase.execute(regId, user);
  }
}

export default ApproveRegistrationUseCase;
module.exports = ApproveRegistrationUseCase;
