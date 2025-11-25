/**
 * GetUsersDto
 * Data Transfer Object for getting users list with filters
 */
class GetUsersDto {
  constructor(data) {
    this.page = data.page;
    this.limit = data.limit;
    this.search = data.search;
    this.role = data.role;
    this.status = data.status;
  }

  static fromQuery(query) {
    return new GetUsersDto({
      page: query.page ? parseInt(query.page, 10) : undefined,
      limit: query.limit ? parseInt(query.limit, 10) : undefined,
      search: query.search,
      role: query.role,
      status: query.status
    });
  }
}

module.exports = GetUsersDto;

