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
    const { search, role, status } = params;
    const whereCondition = {};

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

    if (status) {
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

