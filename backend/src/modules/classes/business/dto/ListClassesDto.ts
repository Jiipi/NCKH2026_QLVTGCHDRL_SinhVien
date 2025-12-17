/**
 * Query interface for listing classes
 */
export interface ListClassesQuery {
  page?: string | number;
  limit?: string | number;
  search?: string;
  khoa?: string;
}

/**
 * Filters interface for class queries
 */
export interface ClassFilters {
  search?: string;
  khoa?: string;
}

/**
 * Pagination interface
 */
export interface ClassPagination {
  page: number;
  limit: number;
}

/**
 * ListClassesDto
 * Data Transfer Object for listing classes
 */
class ListClassesDto {
  page: number = 1;
  limit: number = 10;
  search: string | null = null;
  khoa: string | null = null;

  static fromQuery(query: ListClassesQuery): ListClassesDto {
    const dto = new ListClassesDto();
    dto.page = parseInt(String(query.page)) || 1;
    dto.limit = parseInt(String(query.limit)) || 10;
    dto.search = query.search || null;
    dto.khoa = query.khoa || null;
    return dto;
  }

  toFilters(): ClassFilters {
    const filters: ClassFilters = {};
    if (this.search) filters.search = this.search;
    if (this.khoa) filters.khoa = this.khoa;
    return filters;
  }

  toPagination(): ClassPagination {
    return {
      page: this.page,
      limit: this.limit
    };
  }
}

export default ListClassesDto;
module.exports = ListClassesDto;
