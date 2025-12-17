/**
 * Roles Module - Type Definitions
 * VaiTro entity types and DTOs
 */

import type { VaiTro, NguoiDung } from '@prisma/client';

// ============== Prisma Entity Types ==============

/**
 * Core Role entity from Prisma
 */
export type Role = VaiTro;

/**
 * Role with related users count
 */
export interface RoleWithUserCount extends Role {
  userCount?: number;
}

// ============== DTO Types ==============

/**
 * Create Role DTO
 */
export interface CreateRoleDto {
  ten_vt: string;
  mo_ta?: string | null;
  quyen_han?: string[] | Record<string, unknown> | null;
}

/**
 * Update Role DTO
 */
export interface UpdateRoleDto {
  ten_vt?: string;
  mo_ta?: string | null;
  quyen_han?: string[] | Record<string, unknown> | null;
}

/**
 * Role Response DTO
 */
export interface RoleDto {
  id: number;
  ten_vt: string;
  mo_ta: string | null;
  quyen_han: unknown;
  ngay_tao: Date;
  userCount?: number;
}

// ============== Filter & Pagination ==============

/**
 * Role Filter Options
 */
export interface RoleFilterOptions {
  search?: string;
}

/**
 * Role Pagination Options
 */
export interface RolePaginationOptions {
  page?: number;
  limit?: number;
}

/**
 * Paginated Roles Result
 */
export interface PaginatedRolesResult {
  items: Role[];
  total: number;
}

// ============== Repository Interface ==============

/**
 * Roles Repository Interface
 */
export interface IRolesRepository {
  findMany(filters?: RoleFilterOptions, pagination?: RolePaginationOptions): Promise<PaginatedRolesResult>;
  findById(id: number): Promise<Role | null>;
  findByName(name: string): Promise<Role | null>;
  create(data: CreateRoleDto): Promise<Role>;
  update(id: number, data: UpdateRoleDto): Promise<Role>;
  delete(id: number): Promise<Role>;
  countUsersWithRole(roleId: number): Promise<number>;
  findUsersWithRole(roleId: number): Promise<Array<{ id: number }>>;
  reassignUsers(oldRoleId: number, newRoleId: number): Promise<{ count: number }>;
  assignRoleToUsers(roleId: number, userIds: number[]): Promise<{ count: number }>;
  countClassesWithHomeroom(userIds: number[]): Promise<number>;
  findStudentsByUserIds(userIds: number[]): Promise<Array<{ id: number }>>;
  findActivitiesByCreators(userIds: number[]): Promise<Array<{ id: number }>>;
  cascadeDeleteUsers(userIds: number[], studentIds: number[], activityIds: number[]): Promise<void>;
}

// ============== Service/UseCase Interfaces ==============

/**
 * Get Roles UseCase Interface
 */
export interface IGetRolesUseCase {
  execute(filters?: RoleFilterOptions, pagination?: RolePaginationOptions): Promise<{
    items: RoleDto[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }>;
}

/**
 * Get Role By Id UseCase Interface
 */
export interface IGetRoleByIdUseCase {
  execute(id: number): Promise<RoleDto>;
}

/**
 * Create Role UseCase Interface
 */
export interface ICreateRoleUseCase {
  execute(data: CreateRoleDto): Promise<RoleDto>;
}

/**
 * Update Role UseCase Interface
 */
export interface IUpdateRoleUseCase {
  execute(id: number, data: UpdateRoleDto): Promise<RoleDto>;
}

/**
 * Delete Role UseCase Interface
 */
export interface IDeleteRoleUseCase {
  execute(id: number): Promise<{ message: string }>;
}

/**
 * Assign Role UseCase Interface
 */
export interface IAssignRoleUseCase {
  execute(roleId: number, userIds: number[]): Promise<{ count: number }>;
}

/**
 * Reassign Users UseCase Interface
 */
export interface IReassignUsersUseCase {
  execute(oldRoleId: number, newRoleId: number): Promise<{ count: number }>;
}

// ============== Controller Interface ==============

/**
 * Roles Controller Interface
 */
export interface IRolesController {
  getRoles(req: unknown, res: unknown): Promise<void>;
  getRoleById(req: unknown, res: unknown): Promise<void>;
  createRole(req: unknown, res: unknown): Promise<void>;
  updateRole(req: unknown, res: unknown): Promise<void>;
  deleteRole(req: unknown, res: unknown): Promise<void>;
  assignRole?(req: unknown, res: unknown): Promise<void>;
}

// ============== Permission/Authorization ==============

/**
 * Permission Types
 */
export type Permission = string;

/**
 * Role with Permissions
 */
export interface RoleWithPermissions extends Role {
  permissions: Permission[];
}

// ============== Module Exports ==============
module.exports = {};
