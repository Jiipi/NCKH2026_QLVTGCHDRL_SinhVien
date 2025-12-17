/**
 * GetActivityHistoryUseCase
 * Use case for getting activity history
 * Follows Single Responsibility Principle (SRP)
 */

import { ForbiddenError } from '../../../../core/errors/AppError';

// Import DTO and scope builder
const GetActivitiesDto = require('../../../activities/business/dto/GetActivitiesDto');
const { buildScope } = require('../../../../app/scopes/scopeBuilder');

/**
 * User object from JWT token
 */
interface AuthUser {
  sub?: string;
  id?: string;
  role: string;
}

/**
 * Filters for activity history
 */
interface ActivityFilters {
  status?: 'cho_duyet' | 'da_duyet' | 'tu_choi' | string;
  semester?: string;
}

/**
 * Pagination options
 */
interface PaginationOptions {
  page?: number;
  limit?: number;
}

/**
 * Interface for GetActivitiesUseCase
 */
interface IGetActivitiesUseCase {
  execute(dto: unknown, user: AuthUser): Promise<unknown>;
}

/**
 * GetActivityHistoryUseCase
 * Use case for getting activity history
 */
class GetActivityHistoryUseCase {
  private getActivitiesUseCase: IGetActivitiesUseCase;

  constructor(getActivitiesUseCase: IGetActivitiesUseCase) {
    this.getActivitiesUseCase = getActivitiesUseCase;
  }

  async execute(user: AuthUser, filters: ActivityFilters = {}, pagination: PaginationOptions = {}): Promise<unknown> {
    if (user.role !== 'GIANG_VIEN') {
      throw new ForbiddenError('Chỉ giảng viên mới được truy cập');
    }

    const { page = 1, limit } = pagination;
    const scope = await buildScope('activities', user);
    
    const dtoData: Record<string, unknown> = {
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

export default GetActivityHistoryUseCase;
module.exports = GetActivityHistoryUseCase;
