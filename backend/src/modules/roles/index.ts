/**
 * Roles Module - TypeScript Index
 */

export type {
  Role,
  RoleWithUserCount,
  CreateRoleDto,
  UpdateRoleDto,
  RoleDto,
  RoleFilterOptions,
  RolePaginationOptions,
  PaginatedRolesResult,
  IRolesRepository,
  IGetRolesUseCase,
  IGetRoleByIdUseCase,
  ICreateRoleUseCase,
  IUpdateRoleUseCase,
  IDeleteRoleUseCase,
  IAssignRoleUseCase,
  IReassignUsersUseCase,
  IRolesController,
  Permission,
  RoleWithPermissions
} from './roles.types';

const routes = require('./presentation/routes/roles.routes');
export { routes };
module.exports = { routes };
