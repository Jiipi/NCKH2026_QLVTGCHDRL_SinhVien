/**
 * GetMyRegistrationsUseCase
 * Use case for retrieving registrations of current user
 */

import type { IRegistrationRepository, UserRegistrationFilters } from '../interfaces/IRegistrationRepository';
import type { AuthUser } from '../helpers/registrationAccess';
import type { DangKyHoatDong } from '@prisma/client';

/**
 * GetMyRegistrationsUseCase
 */
export class GetMyRegistrationsUseCase {
  private registrationRepository: IRegistrationRepository;

  constructor(registrationRepository: IRegistrationRepository) {
    this.registrationRepository = registrationRepository;
  }

  async execute(user: AuthUser, filters: UserRegistrationFilters = {}): Promise<DangKyHoatDong[]> {
    const where: UserRegistrationFilters = {};
    if (filters.status) {
      where.status = filters.status;
    }

    const userId = user.id || user.sub;
    const registrations = await this.registrationRepository.findByUser(userId, where);
    return registrations;
  }
}

export default GetMyRegistrationsUseCase;
