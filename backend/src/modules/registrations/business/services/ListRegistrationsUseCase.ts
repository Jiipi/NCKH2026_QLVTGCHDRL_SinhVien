/**
 * ListRegistrationsUseCase
 * Use case for listing registrations with filters and pagination
 * Follows Single Responsibility Principle (SRP)
 */

import { ListRegistrationsDto } from '../dto/ListRegistrationsDto';
import { buildScope } from '../../../../app/scopes/scopeBuilder';
import { parseSemesterString } from '../../../../core/utils/semester';
import type { IRegistrationRepository, RegistrationIncludeOptions } from '../interfaces/IRegistrationRepository';
import type { AuthUser } from '../helpers/registrationAccess';
import type { RegistrationStatusVN, RegistrationStatusEN } from '../../registrations.types';
import type { HocKy } from '@prisma/client';

/**
 * Status mapping from EN to VN
 */
const STATUS_MAP: Record<string, RegistrationStatusVN> = {
  'PENDING': 'cho_duyet',
  'APPROVED': 'da_duyet',
  'REJECTED': 'tu_choi',
  'ATTENDED': 'da_tham_gia',
  'cho_duyet': 'cho_duyet',
  'da_duyet': 'da_duyet',
  'tu_choi': 'tu_choi',
  'da_tham_gia': 'da_tham_gia'
};

/**
 * Pagination info
 */
export interface PaginationInfo {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

/**
 * List result
 */
export interface ListRegistrationsResult<T> {
  data: T[];
  pagination: PaginationInfo;
}

/**
 * Where clause type
 */
interface WhereClause {
  trang_thai_dk?: RegistrationStatusVN;
  hd_id?: string;
  hoat_dong?: {
    hoc_ky?: HocKy;
    nam_hoc?: {
      contains: string;
    };
  };
  [key: string]: unknown;
}

/**
 * ListRegistrationsUseCase
 */
export class ListRegistrationsUseCase {
  private registrationRepository: IRegistrationRepository;

  constructor(registrationRepository: IRegistrationRepository) {
    this.registrationRepository = registrationRepository;
  }

  async execute<T = unknown>(dto: ListRegistrationsDto, user: AuthUser): Promise<ListRegistrationsResult<T>> {
    const scope = await buildScope('registrations', user as { sub: string; role: string; [key: string]: unknown });
    const where: WhereClause = { ...scope };

    if (dto.status) {
      // Map status to legacy schema
      where.trang_thai_dk = STATUS_MAP[dto.status] || (dto.status as RegistrationStatusVN);
    }

    if (dto.activityId) {
      where.hd_id = String(dto.activityId);
    }

    const normalizedLimit = Number.isFinite(dto.limit) && dto.limit > 0 ? dto.limit : null;
    const skip = normalizedLimit ? (dto.page - 1) * normalizedLimit : 0;

    const include: RegistrationIncludeOptions = {
      activity: true,
      user: true,
      approvedBy: dto.includeApprover !== false
    };

    if (dto.semester) {
      const parsed = parseSemesterString(dto.semester);
      if (parsed?.year) {
        where.hoat_dong = {
          ...(where.hoat_dong || {}),
          hoc_ky: parsed.semester as HocKy,
          nam_hoc: {
            contains: parsed.year
          }
        };
      }
    }

    const result = await this.registrationRepository.findMany<T>({
      where,
      skip,
      limit: normalizedLimit || undefined,
      include
    });

    return {
      data: result.items,
      pagination: {
        page: normalizedLimit ? dto.page : 1,
        limit: normalizedLimit || result.items.length,
        total: result.total,
        totalPages: normalizedLimit ? Math.ceil(result.total / normalizedLimit) : 1
      }
    };
  }
}

export default ListRegistrationsUseCase;
