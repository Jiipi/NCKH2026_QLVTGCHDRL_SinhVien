const ListClassesDto = require('../dto/ListClassesDto');
const { buildScope } = require('../../../../app/scopes/scopeBuilder');

/**
 * ListClassesUseCase
 * Use case for listing classes with filters and pagination
 * Follows Single Responsibility Principle (SRP)
 */
class ListClassesUseCase {
  constructor(classRepository) {
    this.classRepository = classRepository;
  }

  async execute(dto, user) {
    const scope = await buildScope('classes', user);
    const filters = dto.toFilters();
    const pagination = dto.toPagination();

    const where = { ...scope, ...filters };
    const page = pagination.page;
    const limit = pagination.limit;
    const skip = (page - 1) * limit;

    const result = await this.classRepository.findMany({ where, skip, limit });

    return {
      data: result.items,
      pagination: {
        page,
        limit,
        total: result.total,
        totalPages: Math.ceil(result.total / limit)
      }
    };
  }
}

module.exports = ListClassesUseCase;

