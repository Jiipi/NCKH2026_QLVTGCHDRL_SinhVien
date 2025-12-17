/**
 * GetRegistrationUseCase
 * Use case for retrieving a registration by ID
 */

import { NotFoundError } from '../../../../core/errors/AppError';
import { checkAccess } from '../helpers/registrationAccess';
import type { IRegistrationRepository, RegistrationIncludeOptions } from '../interfaces/IRegistrationRepository';
import type { AuthUser, RegistrationForAccess } from '../helpers/registrationAccess';

/**
 * GetRegistrationUseCase
 */
export class GetRegistrationUseCase {
  private registrationRepository: IRegistrationRepository;

  constructor(registrationRepository: IRegistrationRepository) {
    this.registrationRepository = registrationRepository;
  }

  async execute(id: string, user: AuthUser): Promise<RegistrationForAccess> {
    const include: RegistrationIncludeOptions = {
      activity: true,
      user: true,
      approvedBy: true
    };

    const registration = await this.registrationRepository.findById<RegistrationForAccess>(id, include);

    if (!registration) {
      throw new NotFoundError('Registration không tồn tại');
    }

    await checkAccess(registration, user);

    return registration;
  }
}

export default GetRegistrationUseCase;
