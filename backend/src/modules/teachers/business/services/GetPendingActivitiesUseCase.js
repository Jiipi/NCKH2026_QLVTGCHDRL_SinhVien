const { ForbiddenError } = require('../../../../core/errors/AppError');
const GetActivitiesDto = require('../../../activities/business/dto/GetActivitiesDto');
const { buildScope } = require('../../../../app/scopes/scopeBuilder');

/**
 * GetPendingActivitiesUseCase
 * Use case for getting pending activities from teacher's classes
 * Follows Single Responsibility Principle (SRP)
 */
class GetPendingActivitiesUseCase {
  constructor(getActivitiesUseCase) {
    this.getActivitiesUseCase = getActivitiesUseCase;
  }

  async execute(user, pagination = {}) {
    if (user.role !== 'GIANG_VIEN') {
      throw new ForbiddenError('Chỉ giảng viên mới được truy cập');
    }

    const scope = await buildScope('activities', user);
    const { semester, page = 1, limit = 100 } = pagination;
    
    const dto = new GetActivitiesDto({
      status: 'cho_duyet',
      semester,
      page,
      limit,
      scope: { activityFilter: scope }
    });

    return await this.getActivitiesUseCase.execute(dto, user);
  }
}

module.exports = GetPendingActivitiesUseCase;

