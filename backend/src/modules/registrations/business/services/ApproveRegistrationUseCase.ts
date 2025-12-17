/**
 * ApproveRegistrationUseCase
 * Use case for approving a registration
 */

import { NotFoundError, ValidationError, ForbiddenError } from '../../../../core/errors/AppError';
import { canApproveRegistration } from '../helpers/registrationAccess';
import type { IRegistrationRepository } from '../interfaces/IRegistrationRepository';
import type { AuthUser, RegistrationForAccess } from '../helpers/registrationAccess';
import type { RegistrationStatusVN, RegistrationStatusEN } from '../../registrations.types';

/**
 * Registration with status fields
 */
interface RegistrationWithStatus extends RegistrationForAccess {
  trang_thai_dk?: RegistrationStatusVN;
  status?: RegistrationStatusEN;
}

/**
 * ApproveRegistrationUseCase
 */
export class ApproveRegistrationUseCase {
  private registrationRepository: IRegistrationRepository;

  constructor(registrationRepository: IRegistrationRepository) {
    this.registrationRepository = registrationRepository;
  }

  async execute(id: string, user: AuthUser): Promise<unknown> {
    const registration = await this.registrationRepository.findById<RegistrationWithStatus>(id, {
      activity: true,
      user: true
    });

    if (!registration) {
      throw new NotFoundError('Registration không tồn tại');
    }

    const canApprove = await canApproveRegistration(registration, user);
    if (!canApprove) {
      throw new ForbiddenError('Bạn không có quyền duyệt registration này');
    }

    // Check status using legacy schema
    const currentStatus = registration.trang_thai_dk || registration.status;
    if (currentStatus === 'da_duyet' || currentStatus === 'APPROVED') {
      throw new ValidationError('Registration đã được duyệt rồi');
    }

    const updated = await this.registrationRepository.update(id, {
      trang_thai_dk: 'da_duyet',
      ngay_duyet: new Date(),
      nguoi_duyet_id: user?.sub || user?.id
    });

    return updated;
  }
}

export default ApproveRegistrationUseCase;
