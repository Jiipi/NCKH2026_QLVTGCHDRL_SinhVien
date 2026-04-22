/**
 * CancelActivityRegistrationUseCase
 * Use case for canceling activity registration
 * Follows Single Responsibility Principle (SRP)
 */

import { NotFoundError } from '../../../../core/errors/AppError';
import type { CancelRegistrationUseCase as CancelRegistrationUseCaseType, CancelResult } from '../../../registrations/business/services/CancelRegistrationUseCase';
import type IActivityRepository from '../interfaces/IActivityRepository';

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
  private activityRepository: IActivityRepository;

  constructor(cancelRegistrationUseCase: CancelRegistrationUseCaseType, activityRepository: IActivityRepository) {
    this.cancelRegistrationUseCase = cancelRegistrationUseCase;
    this.activityRepository = activityRepository;
  }

  async execute(activityId: string, user: AuthUser): Promise<CancelResult> {
    // Get student ID from user ID
    const student = await this.activityRepository.findStudentByUserId(user.sub);
    
    if (!student) {
      throw new NotFoundError('Không tìm thấy thông tin sinh viên');
    }

    // Find registration by activity ID and user ID
    const registration = await this.activityRepository.findUserRegistration(activityId, student.id);

    if (!registration) {
      throw new NotFoundError('Không tìm thấy đăng ký');
    }

    // Use cancel registration use case
    const result = await this.cancelRegistrationUseCase.execute(registration.id, user);
    
    return result;
  }
}

export default CancelActivityRegistrationUseCase;
