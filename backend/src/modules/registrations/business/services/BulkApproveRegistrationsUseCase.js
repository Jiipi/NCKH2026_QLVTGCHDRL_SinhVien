const { ValidationError } = require('../../../../core/errors/AppError');

/**
 * BulkApproveRegistrationsUseCase
 * Use case for approving multiple registrations
 */
class BulkApproveRegistrationsUseCase {
  constructor(registrationRepository) {
    this.registrationRepository = registrationRepository;
  }

  async execute(ids, approverId) {
    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      throw new ValidationError('ids phải là array và không được rỗng');
    }

    // approverId can be user object or user ID string
    const approverIdValue = typeof approverId === 'object' ? (approverId.sub || approverId.id) : approverId;

    const result = await this.registrationRepository.bulkApprove(ids, approverIdValue);

    return {
      affected: result.count || result
    };
  }
}

module.exports = BulkApproveRegistrationsUseCase;

