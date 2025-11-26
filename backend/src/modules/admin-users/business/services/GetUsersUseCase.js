const { validatePaginationParams, createQueryOptions, createPaginationResponse } = require('../../../../core/utils/pagination');
const { mapUserToListItem } = require('../utils/admin-users.mappers');
const GetUsersDto = require('../dto/GetUsersDto');
const { ROLE_ALIASES } = require('../utils/admin-users.constants');

const ADMIN_USERS_MAX_LIMIT = 1000;

/**
 * GetUsersUseCase
 * Use case for retrieving paginated list of users with filters
 * Follows Single Responsibility Principle (SRP)
 */
class GetUsersUseCase {
  constructor(adminUserRepository) {
    this.adminUserRepository = adminUserRepository;
  }

  async execute(dto) {
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

  async buildFilterConditions(params = {}) {
    const { search, role, status, userIds, excludeUserIds, excludeStatus } = params;
    const whereCondition = {};

    // Filter by specific user IDs (for online users filter)
    if (userIds && Array.isArray(userIds) && userIds.length > 0) {
      whereCondition.id = { in: userIds };
    }

    // Exclude specific user IDs (for offline users filter)
    if (excludeUserIds && Array.isArray(excludeUserIds) && excludeUserIds.length > 0) {
      whereCondition.id = { 
        ...(whereCondition.id || {}),
        notIn: excludeUserIds 
      };
    }

    // Exclude specific status (for offline users - exclude locked)
    if (excludeStatus) {
      whereCondition.trang_thai = { not: excludeStatus };
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
    }

    return whereCondition;
  }

  normalizeRole(role) {
    if (!role) return role;
    return ROLE_ALIASES[role] || role;
  }
}

module.exports = GetUsersUseCase;

