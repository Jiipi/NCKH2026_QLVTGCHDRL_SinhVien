import type { VaiTro } from '@prisma/client';

/**
 * Query parameters interface for listing users
 */
export interface ListUsersQuery {
  page?: string | number;
  limit?: string | number;
  search?: string;
  role?: string;
  khoa?: string;
  lop?: string;
}

/**
 * Filter object interface
 */
export interface ListUsersFilters {
  search?: string;
  vai_tro?: {
    ten_vt: string;
  };
  khoa?: string;
  lop?: string;
}

/**
 * Pagination object interface
 */
export interface Pagination {
  page: number;
  limit: number;
}

/**
 * ListUsersDto
 * Data Transfer Object for listing users
 */
class ListUsersDto {
  page: number = 1;
  limit: number = 10;
  search: string | null = null;
  role: string | null = null;
  khoa: string | null = null;
  lop: string | null = null;

  static fromQuery(query: ListUsersQuery): ListUsersDto {
    const dto = new ListUsersDto();
    dto.page = parseInt(String(query.page)) || 1;
    dto.limit = parseInt(String(query.limit)) || 10;
    dto.search = query.search || null;
    dto.role = query.role || null;
    dto.khoa = query.khoa || null;
    dto.lop = query.lop || null;
    return dto;
  }

  toFilters(): ListUsersFilters {
    const filters: ListUsersFilters = {};
    if (this.search) filters.search = this.search;
    if (this.role) {
      filters.vai_tro = {
        ten_vt: this.role
      };
    }
    if (this.khoa) filters.khoa = this.khoa;
    if (this.lop) filters.lop = this.lop;
    return filters;
  }

  toPagination(): Pagination {
    return {
      page: this.page,
      limit: this.limit
    };
  }
}

export default ListUsersDto;
module.exports = ListUsersDto;
