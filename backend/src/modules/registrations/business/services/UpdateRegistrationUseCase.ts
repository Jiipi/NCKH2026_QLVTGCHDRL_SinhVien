/**
 * UpdateRegistrationUseCase
 * Use case for updating a registration (note/status)
 */

import { NotFoundError, ForbiddenError } from '../../../../core/errors/AppError';
import type { IRegistrationRepository, UpdateRegistrationData } from '../interfaces/IRegistrationRepository';
import type { AuthUser, RegistrationForAccess } from '../helpers/registrationAccess';
import type { RegistrationStatusEN, RegistrationStatusVN } from '../../registrations.types';

/**
 * Update data from request
 */
export interface UpdateRegistrationInput {
  note?: string;
  status?: RegistrationStatusEN | RegistrationStatusVN | string;
}

/**
 * Registration with user ID
 */
interface RegistrationWithUser extends RegistrationForAccess {
  userId?: string;
}

/**
 * UpdateRegistrationUseCase
 */
export class UpdateRegistrationUseCase {
  private registrationRepository: IRegistrationRepository;

  constructor(registrationRepository: IRegistrationRepository) {
    this.registrationRepository = registrationRepository;
  }

  async execute(id: string, data: UpdateRegistrationInput, user: AuthUser): Promise<unknown> {
    const registration = await this.registrationRepository.findById<RegistrationWithUser>(id, {
      activity: true,
      user: true
    });

    if (!registration) {
      throw new NotFoundError('Registration không tồn tại');
    }

    if (user.role !== 'ADMIN' && registration.userId !== user.id) {
      throw new ForbiddenError('Bạn không có quyền sửa đăng ký này');
    }

    const allowedFields: UpdateRegistrationData = {};
    if (data.note !== undefined) allowedFields.note = data.note;
    if (data.status !== undefined) allowedFields.status = data.status;

    const updated = await this.registrationRepository.update(id, allowedFields);
    return updated;
  }
}

export default UpdateRegistrationUseCase;
