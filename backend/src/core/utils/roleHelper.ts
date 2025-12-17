/**
 * Role Helper Utilities
 * Tách logic chuẩn hóa vai trò để tránh duplicate code
 * @module core/utils/roleHelper
 */

import { UserRole } from '../types';

/**
 * Role mapping type
 */
type RoleMap = Record<string, UserRole | string>;

/**
 * Chuẩn hóa tên vai trò (mapping các biến thể tiếng Việt sang code chuẩn)
 * Sử dụng cho middleware auth và các nơi cần normalize role
 *
 * @param input - Tên vai trò cần chuẩn hóa
 * @returns Tên vai trò đã chuẩn hóa hoặc undefined nếu input rỗng
 */
export function normalizeRole(input: string | undefined | null): UserRole | string | undefined {
  if (!input) return undefined;
  const raw = String(input).trim();
  const upper = raw.toUpperCase();
  const noAccent = upper.normalize('NFD').replace(/\p{Diacritic}/gu, '');

  const map: RoleMap = {
    'ADMIN': 'ADMIN',
    'QUẢN TRỊ VIÊN': 'ADMIN',
    'QUAN TRI VIEN': 'ADMIN',
    'QUAN_TRI_VIEN': 'ADMIN',
    'GIẢNG VIÊN': 'GIANG_VIEN',
    'GIANG VIEN': 'GIANG_VIEN',
    'GIANG_VIEN': 'GIANG_VIEN',
    'SINH VIÊN': 'SINH_VIEN',
    'SINH VIEN': 'SINH_VIEN',
    'SINH_VIEN': 'SINH_VIEN',
    'LỚP TRƯỞNG': 'LOP_TRUONG',
    'LOP TRUONG': 'LOP_TRUONG',
    'LOP_TRUONG': 'LOP_TRUONG'
  };

  return map[upper] || map[noAccent] || upper; // fallback giữ nguyên upper
}

/**
 * Chuẩn hóa tên vai trò cho RBAC (không trả về undefined)
 * Sử dụng cho rbac.js và các nơi cần so sánh role
 *
 * @param input - Tên vai trò cần chuẩn hóa
 * @returns Tên vai trò đã chuẩn hóa (trả về chuỗi rỗng nếu input rỗng)
 */
export function normalizeRoleName(input: string | undefined | null): string {
  if (!input) return '';
  const up = String(input).trim().toUpperCase();
  const noAccent = up.normalize('NFD').replace(/\p{Diacritic}/gu, '');

  const map: RoleMap = {
    'ADMIN': 'ADMIN',
    'QUAN TRI VIEN': 'ADMIN',
    'QUAN_TRI_VIEN': 'ADMIN',
    'GIANG VIEN': 'GIANG_VIEN',
    'GIANG_VIEN': 'GIANG_VIEN',
    'SINH VIEN': 'SINH_VIEN',
    'SINH_VIEN': 'SINH_VIEN',
    'SINH_VI?N': 'SINH_VIEN',
    'SINH VI?N': 'SINH_VIEN',
    'LOP TRUONG': 'LOP_TRUONG',
    'LOP_TRUONG': 'LOP_TRUONG'
  };

  return map[up] || map[noAccent] || up;
}

/**
 * Chuẩn hóa mã vai trò từ label tiếng Việt
 * Sử dụng cho auth.model.js để map Vietnamese labels sang role codes
 *
 * @param label - Label vai trò tiếng Việt
 * @returns Mã vai trò chuẩn
 */
export function normalizeRoleCode(label: string | undefined | null): string {
  const r = (label || '').toString().trim().toLowerCase();

  if (r.includes('quản trị')) return 'ADMIN';
  if (r.includes('giảng viên')) return 'GIANG_VIEN';
  if (r.includes('lớp trưởng')) return 'LOP_TRUONG';
  if (r.includes('hỗ trợ')) return 'HO_TRO';
  if (r.includes('sinh viên')) return 'SINH_VIEN';

  return label?.toString().toUpperCase() || 'SINH_VIEN';
}

/**
 * Kiểm tra xem role có phải là admin không
 *
 * @param role - Tên vai trò
 * @returns true nếu là admin
 */
export function isAdmin(role: string | undefined | null): boolean {
  return normalizeRole(role) === 'ADMIN';
}

/**
 * Kiểm tra xem role có phải là giảng viên hoặc cao hơn không
 *
 * @param role - Tên vai trò
 * @returns true nếu là giảng viên hoặc admin
 */
export function isTeacherOrAbove(role: string | undefined | null): boolean {
  const normalized = normalizeRole(role);
  return ['ADMIN', 'GIANG_VIEN'].includes(normalized as string);
}

/**
 * Kiểm tra xem role có phải là lớp trưởng hoặc cao hơn không
 *
 * @param role - Tên vai trò
 * @returns true nếu là lớp trưởng, giảng viên hoặc admin
 */
export function isMonitorOrAbove(role: string | undefined | null): boolean {
  const normalized = normalizeRole(role);
  return ['ADMIN', 'GIANG_VIEN', 'LOP_TRUONG'].includes(normalized as string);
}

// CommonJS compatibility
module.exports = {
  normalizeRole,
  normalizeRoleName,
  normalizeRoleCode,
  isAdmin,
  isTeacherOrAbove,
  isMonitorOrAbove
};
