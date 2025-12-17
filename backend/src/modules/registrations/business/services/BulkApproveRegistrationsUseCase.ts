/**
 * BulkApproveRegistrationsUseCase
 * Use case for approving multiple registrations
 */

import { ValidationError } from '../../../../core/errors/AppError';
import type { IRegistrationRepository } from '../interfaces/IRegistrationRepository';
import type { AuthUser } from '../helpers/registrationAccess';

/**
 * Result of bulk approve operation
 */
export interface BulkApproveResult {
  affected: number;
}

/**
 * BulkApproveRegistrationsUseCase
 */
export class BulkApproveRegistrationsUseCase {
  private registrationRepository: IRegistrationRepository;

  constructor(registrationRepository: IRegistrationRepository) {
    this.registrationRepository = registrationRepository;
  }

  async execute(ids: string[], approverId: string | AuthUser): Promise<BulkApproveResult> {
    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      throw new ValidationError('ids phải là array và không được rỗng');
    }

    // approverId can be user object or user ID string
    const approverIdValue = typeof approverId === 'object' 
      ? (approverId.sub || approverId.id) 
      : approverId;

    const result = await this.registrationRepository.bulkApprove(ids, approverIdValue);

    return {
      affected: result.count
    };
  }
}

export default BulkApproveRegistrationsUseCase;
