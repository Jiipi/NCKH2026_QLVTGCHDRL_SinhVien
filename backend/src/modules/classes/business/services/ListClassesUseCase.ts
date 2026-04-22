import type ListClassesDto from '../dto/ListClassesDto';
import type IClassRepository from '../interfaces/IClassRepository';
import type { Lop } from '@prisma/client';

import { buildScope } from '../../../../app/scopes/scopeBuilder';

/**
 * User interface for authorization
 */
export interface AuthUser {
  id: number | string;
  role: string;
  class?: string;
}

/**
 * Paginated result interface
 */
export interface PaginatedResult<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

/**
 * Class with student count
 */
export interface ClassWithCount extends Lop {
  total_sinh_vien?: number;
}

/**
 * ListClassesUseCase
 * Use case for listing classes with filters and pagination
 * Follows Single Responsibility Principle (SRP)
 */
class ListClassesUseCase {
  private classRepository: IClassRepository;

  constructor(classRepository: IClassRepository) {
    this.classRepository = classRepository;
  }

  async execute(dto: ListClassesDto, user: AuthUser): Promise<PaginatedResult<ClassWithCount>> {
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

export default ListClassesUseCase;
module.exports = ListClassesUseCase;
