/**
 * GetUsersDto
 * Data Transfer Object for getting users list with filters
 */

export interface GetUsersDtoData {
  page?: number;
  limit?: number;
  search?: string;
  role?: string;
  status?: string;
  userIds?: string[];
  excludeUserIds?: string[];
  excludeStatus?: string;
}

class GetUsersDto implements GetUsersDtoData {
  page?: number;
  limit?: number;
  search?: string;
  role?: string;
  status?: string;
  userIds?: string[];
  excludeUserIds?: string[];
  excludeStatus?: string;

  constructor(data: GetUsersDtoData) {
    this.page = data.page;
    this.limit = data.limit;
    this.search = data.search;
    this.role = data.role;
    this.status = data.status;
    this.userIds = data.userIds;
    this.excludeUserIds = data.excludeUserIds;
    this.excludeStatus = data.excludeStatus;
  }

  static fromQuery(query: Record<string, any>): GetUsersDto {
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

export default GetUsersDto;
module.exports = GetUsersDto;
