/**
 * IActivityRepository Interface
 * Contract for activity data access
 * Follows Dependency Inversion Principle (DIP)
 */

import type { HoatDong, Prisma } from '@prisma/client';

/**
 * Options for findMany queries
 */
export interface FindManyOptions {
  skip?: number;
  take?: number;
  page?: number;
  limit?: number | string | null;
  sort?: string;
  order?: 'asc' | 'desc';
  orderBy?: Prisma.HoatDongOrderByWithRelationInput | Prisma.HoatDongOrderByWithRelationInput[];
  include?: Prisma.HoatDongInclude;
}

/**
 * Paginated result for findMany
 */
export interface FindManyResult {
  items: HoatDong[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

/**
 * Activity repository interface
 */
abstract class IActivityRepository {
  abstract findMany(
    where?: Prisma.HoatDongWhereInput,
    options?: FindManyOptions
  ): Promise<HoatDong[] | FindManyResult>;

  abstract findById(
    id: string,
    where?: Prisma.HoatDongWhereInput,
    include?: Prisma.HoatDongInclude
  ): Promise<HoatDong | null>;

  abstract create(data: Prisma.HoatDongCreateInput): Promise<HoatDong>;

  abstract update(id: string, data: Prisma.HoatDongUpdateInput): Promise<HoatDong>;

  abstract delete(id: string): Promise<HoatDong>;

  abstract count(where?: Prisma.HoatDongWhereInput): Promise<number>;
}

export default IActivityRepository;
module.exports = IActivityRepository;
