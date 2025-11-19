const ListRegistrationsDto = require('../dto/ListRegistrationsDto');
const { buildScope } = require('../../../../app/scopes/scopeBuilder');

/**
 * ListRegistrationsUseCase
 * Use case for listing registrations with filters and pagination
 * Follows Single Responsibility Principle (SRP)
 */
class ListRegistrationsUseCase {
  constructor(registrationRepository) {
    this.registrationRepository = registrationRepository;
  }

  async execute(dto, user) {
    const scope = await buildScope('registrations', user);
    const where = { ...scope };

    if (dto.status) {
      where.status = dto.status;
    }

    if (dto.activityId) {
      where.activityId = parseInt(dto.activityId, 10);
    }

    const skip = (dto.page - 1) * dto.limit;

    const include = {
      activity: true,
      user: true,
      approvedBy: dto.includeApprover !== false
    };

    const result = await this.registrationRepository.findMany({
      where,
      skip,
      limit: dto.limit,
      include
    });

    return {
      data: result.items,
      pagination: {
        page: dto.page,
        limit: dto.limit,
        total: result.total,
        totalPages: Math.ceil(result.total / dto.limit)
      }
    };
  }
}

module.exports = ListRegistrationsUseCase;

