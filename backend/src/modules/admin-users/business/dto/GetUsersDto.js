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
    this.userIds = data.userIds; // Filter by specific user IDs (for online users)
    this.excludeUserIds = data.excludeUserIds; // Exclude specific user IDs (for offline users)
    this.excludeStatus = data.excludeStatus; // Exclude specific status
  }

  static fromQuery(query) {
    return new GetUsersDto({
      page: query.page ? parseInt(query.page, 10) : undefined,
      limit: query.limit ? parseInt(query.limit, 10) : undefined,
      search: query.search,
      role: query.role,
      status: query.status,
      userIds: query.userIds,
      excludeUserIds: query.excludeUserIds,
      excludeStatus: query.excludeStatus
    });
  }
}

module.exports = GetUsersDto;

