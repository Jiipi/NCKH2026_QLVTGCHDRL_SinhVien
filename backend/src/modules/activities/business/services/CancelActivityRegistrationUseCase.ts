/**
 * CancelActivityRegistrationUseCase
 * Use case for canceling activity registration
 * Follows Single Responsibility Principle (SRP)
 */

import { NotFoundError, ForbiddenError, ValidationError } from '../../../../core/errors/AppError';
import { prisma } from '../../../../data/infrastructure/prisma/client';
import type { CancelRegistrationUseCase as CancelRegistrationUseCaseType, CancelResult } from '../../../registrations/business/services/CancelRegistrationUseCase';

/**
 * User context for authentication
 */
interface AuthUser {
  sub: string;
  role?: string;
  [key: string]: unknown;
}

/**
 * CancelActivityRegistrationUseCase
 */
class CancelActivityRegistrationUseCase {
  private cancelRegistrationUseCase: CancelRegistrationUseCaseType;

  constructor(cancelRegistrationUseCase: CancelRegistrationUseCaseType) {
    this.cancelRegistrationUseCase = cancelRegistrationUseCase;
  }

  async execute(activityId: string, user: AuthUser): Promise<CancelResult> {
    // Get student ID from user ID
    const student = await prisma.sinhVien.findUnique({
      where: { nguoi_dung_id: user.sub },
      select: { id: true }
    });
    
    if (!student) {
      throw new NotFoundError('Không tìm thấy thông tin sinh viên');
    }

    // Find registration by activity ID and user ID
    const registration = await prisma.dangKyHoatDong.findFirst({
      where: {
        hd_id: activityId,
        sv_id: student.id
      }
    });

    if (!registration) {
      throw new NotFoundError('Không tìm thấy đăng ký');
    }

    // Use cancel registration use case
    const result = await this.cancelRegistrationUseCase.execute(registration.id, user);
    
    return result;
  }
}

export default CancelActivityRegistrationUseCase;
