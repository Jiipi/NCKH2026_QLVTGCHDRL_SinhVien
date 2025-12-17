/**
 * DeleteRegistrationUseCase
 * Use case for deleting a registration
 */

import { NotFoundError, ForbiddenError } from '../../../../core/errors/AppError';
import type { IRegistrationRepository } from '../interfaces/IRegistrationRepository';
import type { AuthUser, RegistrationForAccess } from '../helpers/registrationAccess';

/**
 * Registration with user ID for delete authorization
 */
interface RegistrationWithUser extends RegistrationForAccess {
  userId?: string;
}

/**
 * DeleteRegistrationUseCase
 */
export class DeleteRegistrationUseCase {
  private registrationRepository: IRegistrationRepository;

  constructor(registrationRepository: IRegistrationRepository) {
    this.registrationRepository = registrationRepository;
  }

  async execute(id: string, user: AuthUser): Promise<void> {
    const registration = await this.registrationRepository.findById<RegistrationWithUser>(id, {
      activity: true,
      user: true
    });

    if (!registration) {
      throw new NotFoundError('Registration không tồn tại');
    }

    if (user.role !== 'ADMIN' && registration.userId !== user.id) {
      throw new ForbiddenError('Bạn không có quyền xóa đăng ký này');
    }

    await this.registrationRepository.delete(id);
  }
}

export default DeleteRegistrationUseCase;
