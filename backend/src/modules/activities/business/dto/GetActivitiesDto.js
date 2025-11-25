/**
 * GetActivitiesDto
 * Data Transfer Object for getting activities list with filters
 */
class GetActivitiesDto {
  constructor(data) {
    this.page = data.page;
    this.limit = data.limit;
    this.search = data.search;
    this.status = data.status;
    this.type = data.type;
    this.semester = data.semester;
    this.sort = data.sort;
    this.order = data.order;
    this.from = data.from;
    this.to = data.to;
    this.scope = data.scope;
  }

  static fromQuery(query, scope) {
    return new GetActivitiesDto({
      page: query.page ? parseInt(query.page, 10) : 1,
      limit: query.limit || 10,
      search: query.search || query.q,
      status: query.status,
      type: query.type,
      semester: query.semesterValue || query.semester,
      sort: query.sort,
      order: query.order,
      from: query.from,
      to: query.to,
      scope
    });
  }
}

module.exports = GetActivitiesDto;

