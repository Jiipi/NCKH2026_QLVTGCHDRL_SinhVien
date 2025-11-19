/**
 * ListRegistrationsDto
 * Data Transfer Object for listing registrations with filters
 */
class ListRegistrationsDto {
  constructor(data) {
    this.page = data.page;
    this.limit = data.limit;
    this.status = data.status;
    this.activityId = data.activityId;
    this.includeApprover = data.includeApprover;
  }

  static fromQuery(query = {}) {
    return new ListRegistrationsDto({
      page: query.page ? parseInt(query.page, 10) : 1,
      limit: query.limit ? parseInt(query.limit, 10) : 20,
      status: query.status,
      activityId: query.activityId,
      includeApprover: query.includeApprover !== 'false'
    });
  }
}

module.exports = ListRegistrationsDto;

