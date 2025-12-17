import type { TrangThaiHoatDong, HocKy } from '@prisma/client';

/**
 * Query parameters for GetActivitiesDto
 */
interface GetActivitiesQuery {
  page?: string | number;
  limit?: string | number;
  search?: string;
  q?: string;
  status?: TrangThaiHoatDong;
  type?: string;
  semesterValue?: string;
  semester?: string;
  sort?: string;
  order?: 'asc' | 'desc';
  from?: string | Date;
  to?: string | Date;
  classId?: string;
  lop_id?: string;
}

/**
 * Scope type for activities
 */
type ActivityScope = 'all' | 'my' | 'class' | 'department' | string;

/**
 * GetActivitiesDto
 * Data Transfer Object for getting activities list with filters
 */
class GetActivitiesDto {
  page: number;
  limit: number | string;
  search?: string;
  status?: TrangThaiHoatDong;
  type?: string;
  semester?: string;
  sort?: string;
  order?: 'asc' | 'desc';
  from?: string | Date;
  to?: string | Date;
  scope?: ActivityScope;
  classId?: string;

  constructor(data: {
    page?: number;
    limit?: number | string;
    search?: string;
    status?: TrangThaiHoatDong;
    type?: string;
    semester?: string;
    sort?: string;
    order?: 'asc' | 'desc';
    from?: string | Date;
    to?: string | Date;
    scope?: ActivityScope;
    classId?: string;
  }) {
    this.page = data.page || 1;
    this.limit = data.limit || 10;
    this.search = data.search;
    this.status = data.status;
    this.type = data.type;
    this.semester = data.semester;
    this.sort = data.sort;
    this.order = data.order;
    this.from = data.from;
    this.to = data.to;
    this.scope = data.scope;
    this.classId = data.classId;
  }

  static fromQuery(query: GetActivitiesQuery, scope?: ActivityScope): GetActivitiesDto {
    return new GetActivitiesDto({
      page: query.page ? parseInt(String(query.page), 10) : 1,
      limit: query.limit || 10,
      search: query.search || query.q,
      status: query.status,
      type: query.type,
      semester: query.semesterValue || query.semester,
      sort: query.sort,
      order: query.order,
      from: query.from,
      to: query.to,
      scope,
      classId: query.classId || query.lop_id
    });
  }
}

export default GetActivitiesDto;
module.exports = GetActivitiesDto;
