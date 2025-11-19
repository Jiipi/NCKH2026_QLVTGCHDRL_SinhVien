const { ValidationError } = require('../../../../core/errors/AppError');

/**
 * BulkApproveRegistrationsUseCase
 * Use case for approving multiple registrations
 */
class BulkApproveRegistrationsUseCase {
  constructor(registrationRepository) {
    this.registrationRepository = registrationRepository;
  }

  async execute(ids, user) {
    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      throw new ValidationError('ids phải là array và không được rỗng');
    }

    const result = await this.registrationRepository.bulkApprove(ids, user.id);

    return {
      affected: result.count || result
    };
  }
}

module.exports = BulkApproveRegistrationsUseCase;

