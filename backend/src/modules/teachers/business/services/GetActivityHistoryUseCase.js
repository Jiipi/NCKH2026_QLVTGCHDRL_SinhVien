const { ForbiddenError } = require('../../../../core/errors/AppError');
const GetActivitiesDto = require('../../../activities/business/dto/GetActivitiesDto');
const { buildScope } = require('../../../../app/scopes/scopeBuilder');

/**
 * GetActivityHistoryUseCase
 * Use case for getting activity history
 * Follows Single Responsibility Principle (SRP)
 */
class GetActivityHistoryUseCase {
  constructor(getActivitiesUseCase) {
    this.getActivitiesUseCase = getActivitiesUseCase;
  }

  async execute(user, filters = {}, pagination = {}) {
    if (user.role !== 'GIANG_VIEN') {
      throw new ForbiddenError('Chỉ giảng viên mới được truy cập');
    }

    const { page = 1, limit = 100 } = pagination;
    const scope = await buildScope('activities', user);
    
    const dtoData = {
      page,
      limit,
      scope: { activityFilter: scope }
    };
    
    if (filters && typeof filters.status === 'string' && ['cho_duyet', 'da_duyet', 'tu_choi'].includes(filters.status)) {
      dtoData.status = filters.status;
    }
    
    if (filters && typeof filters.semester === 'string' && filters.semester) {
      dtoData.semester = filters.semester;
    }

    const dto = new GetActivitiesDto(dtoData);

    return await this.getActivitiesUseCase.execute(dto, user);
  }
}

module.exports = GetActivityHistoryUseCase;

