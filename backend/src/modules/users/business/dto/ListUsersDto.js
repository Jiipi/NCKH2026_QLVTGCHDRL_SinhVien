/**
 * ListUsersDto
 * Data Transfer Object for listing users
 */
class ListUsersDto {
  constructor() {
    this.page = 1;
    this.limit = 10;
    this.search = null;
    this.role = null;
    this.khoa = null;
    this.lop = null;
  }

  static fromQuery(query) {
    const dto = new ListUsersDto();
    dto.page = parseInt(query.page) || 1;
    dto.limit = parseInt(query.limit) || 10;
    dto.search = query.search || null;
    dto.role = query.role || null;
    dto.khoa = query.khoa || null;
    dto.lop = query.lop || null;
    return dto;
  }

  toFilters() {
    const filters = {};
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

  toPagination() {
    return {
      page: this.page,
      limit: this.limit
    };
  }
}

module.exports = ListUsersDto;

