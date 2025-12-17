/**
 * RejectRegistrationUseCase
 * Use case for rejecting a registration
 */

import { NotFoundError, ForbiddenError } from '../../../../core/errors/AppError';
import { canApproveRegistration } from '../helpers/registrationAccess';
import type { IRegistrationRepository } from '../interfaces/IRegistrationRepository';
import type { AuthUser, RegistrationForAccess } from '../helpers/registrationAccess';

/**
 * RejectRegistrationUseCase
 */
export class RejectRegistrationUseCase {
  private registrationRepository: IRegistrationRepository;

  constructor(registrationRepository: IRegistrationRepository) {
    this.registrationRepository = registrationRepository;
  }

  async execute(id: string, reason: string | undefined, user: AuthUser): Promise<unknown> {
    const registration = await this.registrationRepository.findById<RegistrationForAccess>(id, {
      activity: true,
      user: true
    });

    if (!registration) {
      throw new NotFoundError('Registration không tồn tại');
    }

    const canApprove = await canApproveRegistration(registration, user);
    if (!canApprove) {
      throw new ForbiddenError('Bạn không có quyền từ chối registration này');
    }

    const updated = await this.registrationRepository.update(id, {
      trang_thai_dk: 'tu_choi',
      ly_do_tu_choi: reason || 'Không đáp ứng yêu cầu',
      ngay_duyet: new Date(),
      nguoi_duyet_id: user?.sub || user?.id
    });

    return updated;
  }
}

export default RejectRegistrationUseCase;
