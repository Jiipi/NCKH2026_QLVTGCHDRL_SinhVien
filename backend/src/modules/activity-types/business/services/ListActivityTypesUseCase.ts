import type { LoaiHoatDong } from '@prisma/client';
import type IActivityTypeRepository from '../interfaces/IActivityTypeRepository';

/**
 * Query parameters for list use case
 */
export interface ListActivityTypesParams {
  page?: number | string;
  limit?: number | string;
  search?: string;
}

/**
 * Paginated result for activity types
 */
export interface ListActivityTypesResult {
  items: LoaiHoatDong[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

/**
 * ListActivityTypesUseCase
 * Use case for listing activity types with pagination
 * Follows Single Responsibility Principle (SRP)
 */
class ListActivityTypesUseCase {
  private activityTypeRepository: IActivityTypeRepository;

  constructor(activityTypeRepository: IActivityTypeRepository) {
    this.activityTypeRepository = activityTypeRepository;
  }

  async execute({ page = 1, limit = 10, search }: ListActivityTypesParams): Promise<ListActivityTypesResult> {
    const pageNum = typeof page === 'string' ? parseInt(page, 10) : page;
    const take = typeof limit === 'string' ? parseInt(limit, 10) : limit;
    const skip = (pageNum - 1) * take;

    const [items, total] = await Promise.all([
      this.activityTypeRepository.findAll({ skip, take, search }),
      this.activityTypeRepository.count(search),
    ]);

    return {
      items,
      total,
      page: pageNum,
      limit: take,
      totalPages: Math.ceil(total / take),
    };
  }
}

export default ListActivityTypesUseCase;
module.exports = ListActivityTypesUseCase;
