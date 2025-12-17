/**
 * GetPendingActivitiesUseCase
 * Use case for getting pending activities from teacher's classes
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
 * Pagination options
 */
interface PaginationOptions {
  semester?: string;
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
 * GetPendingActivitiesUseCase
 * Use case for getting pending activities from teacher's classes
 */
class GetPendingActivitiesUseCase {
  private getActivitiesUseCase: IGetActivitiesUseCase;

  constructor(getActivitiesUseCase: IGetActivitiesUseCase) {
    this.getActivitiesUseCase = getActivitiesUseCase;
  }

  async execute(user: AuthUser, pagination: PaginationOptions = {}): Promise<unknown> {
    if (user.role !== 'GIANG_VIEN') {
      throw new ForbiddenError('Chỉ giảng viên mới được truy cập');
    }

    const scope = await buildScope('activities', user);
    const { semester, page = 1, limit } = pagination;

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

export default GetPendingActivitiesUseCase;
module.exports = GetPendingActivitiesUseCase;
