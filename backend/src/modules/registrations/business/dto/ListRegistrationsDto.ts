/**
 * ListRegistrationsDto
 * Data Transfer Object for listing registrations with filters
 */

import type { RegistrationStatusEN, RegistrationStatusVN } from '../../registrations.types';

export interface ListRegistrationsQuery {
  page?: string | number;
  limit?: string | number;
  status?: RegistrationStatusEN | RegistrationStatusVN | string;
  activityId?: string;
  includeApprover?: string | boolean;
  semester?: string;
}

export interface ListRegistrationsInput {
  page: number;
  limit: number;
  status?: RegistrationStatusEN | RegistrationStatusVN | string;
  activityId?: string;
  includeApprover: boolean;
  semester?: string;
}

export class ListRegistrationsDto {
  public page: number;
  public limit: number;
  public status?: RegistrationStatusEN | RegistrationStatusVN | string;
  public activityId?: string;
  public includeApprover: boolean;
  public semester?: string;

  constructor(data: ListRegistrationsInput) {
    this.page = data.page;
    this.limit = data.limit;
    this.status = data.status;
    this.activityId = data.activityId;
    this.includeApprover = data.includeApprover;
    this.semester = data.semester;
  }

  static fromQuery(query: ListRegistrationsQuery = {}): ListRegistrationsDto {
    return new ListRegistrationsDto({
      page: query.page ? parseInt(String(query.page), 10) : 1,
      limit: query.limit ? parseInt(String(query.limit), 10) : 20,
      status: query.status,
      activityId: query.activityId,
      includeApprover: query.includeApprover !== 'false' && query.includeApprover !== false,
      semester: query.semester
    });
  }
}

export default ListRegistrationsDto;
module.exports = ListRegistrationsDto;
