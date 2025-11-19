/**
 * ListClassesDto
 * Data Transfer Object for listing classes
 */
class ListClassesDto {
  constructor() {
    this.page = 1;
    this.limit = 10;
    this.search = null;
    this.khoa = null;
  }

  static fromQuery(query) {
    const dto = new ListClassesDto();
    dto.page = parseInt(query.page) || 1;
    dto.limit = parseInt(query.limit) || 10;
    dto.search = query.search || null;
    dto.khoa = query.khoa || null;
    return dto;
  }

  toFilters() {
    const filters = {};
    if (this.search) filters.search = this.search;
    if (this.khoa) filters.khoa = this.khoa;
    return filters;
  }

  toPagination() {
    return {
      page: this.page,
      limit: this.limit
    };
  }
}

module.exports = ListClassesDto;

