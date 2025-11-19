const { ForbiddenError } = require('../../../../core/errors/AppError');
const activitiesService = require('../../../activities/activities.service');
const { buildScope } = require('../../../../app/scopes/scopeBuilder');

/**
 * GetPendingActivitiesUseCase
 * Use case for getting pending activities from teacher's classes
 * Follows Single Responsibility Principle (SRP)
 */
class GetPendingActivitiesUseCase {
  async execute(user, pagination = {}) {
    if (user.role !== 'GIANG_VIEN') {
      throw new ForbiddenError('Chỉ giảng viên mới được truy cập');
    }

    const scope = await buildScope('activities', user);
    const { semester, page = 1, limit = 100 } = pagination;
    
    const listFilters = {
      trangThai: 'cho_duyet',
      scope: { activityFilter: scope }
    };
    
    if (semester) {
      listFilters.semester = semester;
    }

    return await activitiesService.list({
      ...listFilters,
      page,
      limit
    }, user);
  }
}

module.exports = GetPendingActivitiesUseCase;

