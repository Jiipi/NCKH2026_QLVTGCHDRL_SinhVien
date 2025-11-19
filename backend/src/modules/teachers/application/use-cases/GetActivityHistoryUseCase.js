const { ForbiddenError } = require('../../../../core/errors/AppError');
const activitiesService = require('../../../activities/activities.service');
const { buildScope } = require('../../../../app/scopes/scopeBuilder');

/**
 * GetActivityHistoryUseCase
 * Use case for getting activity history
 * Follows Single Responsibility Principle (SRP)
 */
class GetActivityHistoryUseCase {
  async execute(user, filters = {}, pagination = {}) {
    if (user.role !== 'GIANG_VIEN') {
      throw new ForbiddenError('Chỉ giảng viên mới được truy cập');
    }

    const { page = 1, limit = 100 } = pagination;
    const scope = await buildScope('activities', user);
    
    const listFilters = {};
    
    if (filters && typeof filters.status === 'string' && ['cho_duyet', 'da_duyet', 'tu_choi'].includes(filters.status)) {
      listFilters.trangThai = filters.status;
    }
    
    if (filters && typeof filters.semester === 'string' && filters.semester) {
      listFilters.semester = filters.semester;
    }

    listFilters.scope = { activityFilter: scope };

    return await activitiesService.list({
      ...listFilters,
      page,
      limit
    }, user);
  }
}

module.exports = GetActivityHistoryUseCase;

