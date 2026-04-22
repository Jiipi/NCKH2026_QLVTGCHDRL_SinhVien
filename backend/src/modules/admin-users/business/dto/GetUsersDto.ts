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

  static fromQuery(query: Record<string, unknown>): GetUsersDto {
    return new GetUsersDto({
      page: query.page ? parseInt(String(query.page), 10) : undefined,
      limit: query.limit ? parseInt(String(query.limit), 10) : undefined,
      search: query.search as string | undefined,
      role: query.role as string | undefined,
      status: query.status as string | undefined,
      userIds: query.userIds as string[] | undefined,
      excludeUserIds: query.excludeUserIds as string[] | undefined,
      excludeStatus: query.excludeStatus as string | undefined
    });
  }
}

export default GetUsersDto;
module.exports = GetUsersDto;
