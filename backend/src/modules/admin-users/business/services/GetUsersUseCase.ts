/**
 * GetUsersUseCase
 * Use case for retrieving paginated list of users with filters
 * Follows Single Responsibility Principle (SRP)
 */

import type { IAdminUserRepository, UserWhereInput, QueryOptions } from '../interfaces/IAdminUserRepository';
import { validatePaginationParams, createQueryOptions, createPaginationResponse } from '../../../../core/utils/pagination';
import { mapUserToListItem, UserListItem } from '../utils/admin-users.mappers';
import type GetUsersDto from '../dto/GetUsersDto';
import { ROLE_ALIASES } from '../utils/admin-users.constants';
import { logDebug } from '../../../../core/logger';

const ADMIN_USERS_MAX_LIMIT = 1000;

interface PaginationResult {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface GetUsersResult {
  users: UserListItem[];
  pagination: PaginationResult;
}

class GetUsersUseCase {
  private adminUserRepository: IAdminUserRepository;

  constructor(adminUserRepository: IAdminUserRepository) {
    this.adminUserRepository = adminUserRepository;
  }

  async execute(dto: GetUsersDto): Promise<GetUsersResult> {
    const paginationParams = validatePaginationParams(dto, {
      defaultPage: 1,
      defaultLimit: 20,
      maxLimit: ADMIN_USERS_MAX_LIMIT
    });

    const whereCondition = await this.buildFilterConditions(dto);
    const queryOptions = createQueryOptions(paginationParams, { ngay_tao: 'desc' });

    const [users, total] = await Promise.all([
      this.adminUserRepository.findUsers(whereCondition, queryOptions),
      this.adminUserRepository.countUsers(whereCondition)
    ]);

    const transformedUsers = users.map(mapUserToListItem);

    return {
      users: transformedUsers,
      pagination: createPaginationResponse({
        page: paginationParams.page,
        limit: paginationParams.limit,
        total,
        maxLimit: ADMIN_USERS_MAX_LIMIT
      })
    };
  }

  async buildFilterConditions(params: GetUsersDto = {} as GetUsersDto): Promise<UserWhereInput> {
    const { search, role, status, userIds, excludeUserIds, excludeStatus } = params;
    const whereCondition: UserWhereInput = {};

    logDebug('[GetUsersUseCase.buildFilterConditions] params', {
      status,
      userIdsCount: Array.isArray(userIds) ? userIds.length : 0,
      excludeUserIdsCount: Array.isArray(excludeUserIds) ? excludeUserIds.length : 0,
      excludeStatus,
      role,
      search
    });

    // Filter by specific user IDs (for online users filter)
    if (userIds && Array.isArray(userIds) && userIds.length > 0) {
      whereCondition.id = { in: userIds };
      logDebug('[GetUsersUseCase.buildFilterConditions] filtering by userIds', { count: userIds.length });
    }

    // Exclude specific user IDs (for offline users filter)
    if (excludeUserIds && Array.isArray(excludeUserIds) && excludeUserIds.length > 0) {
      whereCondition.id = { 
        ...(typeof whereCondition.id === 'object' ? whereCondition.id : {}),
        notIn: excludeUserIds 
      };
      logDebug('[GetUsersUseCase.buildFilterConditions] excluding userIds', { count: excludeUserIds.length });
    }

    // Exclude specific status (for offline users - exclude locked)
    if (excludeStatus) {
      whereCondition.trang_thai = { not: excludeStatus };
      logDebug('[GetUsersUseCase.buildFilterConditions] excluding status', { excludeStatus });
    }

    if (search) {
      whereCondition.OR = [
        { ho_ten: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
        { ten_dn: { contains: search, mode: 'insensitive' } }
      ];
    }

    if (role) {
      const normalizedRole = this.normalizeRole(role);
      const roleRecord = await this.adminUserRepository.findRoleByName(normalizedRole);
      if (roleRecord) {
        whereCondition.vai_tro_id = roleRecord.id;
      }
    }

    // Status filter for locked accounts (status = 'khoa')
    // Note: 'hoat_dong' and 'khong_hoat_dong' are handled via userIds from sessions
    if (status && status === 'khoa') {
      whereCondition.trang_thai = status;
      logDebug('[GetUsersUseCase.buildFilterConditions] filtering by locked status');
    }

    logDebug('[GetUsersUseCase.buildFilterConditions] final where condition prepared');
    return whereCondition;
  }

  private normalizeRole(role: string): string {
    if (!role) return role;
    const trimmed = role.toString().trim();
    const sanitized = trimmed
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-zA-Z0-9]/g, '_')
      .toUpperCase();
    return ROLE_ALIASES[sanitized] || ROLE_ALIASES[trimmed] || sanitized;
  }
}

export default GetUsersUseCase;
module.exports = GetUsersUseCase;
