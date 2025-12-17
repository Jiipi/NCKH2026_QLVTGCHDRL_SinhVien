// Utility to normalize various role strings to canonical codes used in FE routing
// Examples:
//  'Sinh viên' -> 'SINH_VIEN'
//  'Giảng Viên' -> 'GIANG_VIEN'
//  'lop_truong' / 'Lớp Trưởng' -> 'LOP_TRUONG'
//  'admin' / 'Quản trị viên' -> 'ADMIN'

export type NormalizedRole = 'ADMIN' | 'GIANG_VIEN' | 'SINH_VIEN' | 'LOP_TRUONG' | string;

/**
 * Role display names mapping
 */
export const ROLE_DISPLAY_NAMES: Record<NormalizedRole, string> = {
  'ADMIN': 'Quản trị viên',
  'GIANG_VIEN': 'Giảng viên',
  'SINH_VIEN': 'Sinh viên',
  'LOP_TRUONG': 'Lớp trưởng'
};

/**
 * Strip Vietnamese accents from a string
 */
function stripAccents(str: string): string {
  return str
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .replace(/đ/gi, 'd');
}

/**
 * Normalize role string to canonical format
 * @param raw - Raw role string from various sources
 * @returns Normalized role code (e.g., 'SINH_VIEN', 'ADMIN')
 */
export function normalizeRole(raw: string | null | undefined): NormalizedRole | undefined {
  if (!raw) return undefined;
  const s = String(raw).trim();
  if (!s) return undefined;
  
  const upper = s.toUpperCase();
  const noAccent = stripAccents(upper);
  const base = noAccent.replace(/[^A-Z0-9 ]+/g, ' ').replace(/\s+/g, ' ').trim();
  
  // Map table
  const map: Record<string, NormalizedRole> = {
    'ADMIN': 'ADMIN',
    'QUAN TRI VIEN': 'ADMIN',
    'QUAN_TRI_VIEN': 'ADMIN',
    'GIANG VIEN': 'GIANG_VIEN',
    'GIANG_VIEN': 'GIANG_VIEN',
    'SINH VIEN': 'SINH_VIEN',
    'SINH_VIEN': 'SINH_VIEN',
    'LOP TRUONG': 'LOP_TRUONG',
    'LOP_TRUONG': 'LOP_TRUONG',
    'CLASS_MONITOR': 'LOP_TRUONG',
    'MONITOR': 'LOP_TRUONG',
    'STUDENT': 'SINH_VIEN',
    'TEACHER': 'GIANG_VIEN'
  };
  
  return map[upper] || map[noAccent] || map[base] || upper;
}

/**
 * Check if a role matches any of the allowed roles
 * @param role - Role to check
 * @param allowedArray - Array of allowed roles
 * @returns True if role matches any allowed role
 */
export function roleMatches(role: string | null | undefined, allowedArray: (string | null | undefined)[] | null | undefined): boolean {
  const r = normalizeRole(role);
  const allowSet = (allowedArray || []).map(normalizeRole);
  if (!r) return false;
  return allowSet.length === 0 || allowSet.includes(r);
}

/**
 * Get display name for a role
 * @param role - Role code
 * @returns Human-readable role name
 */
export function getRoleDisplayName(role: string | null | undefined): string {
  const normalized = normalizeRole(role);
  if (!normalized) return 'Không xác định';
  return ROLE_DISPLAY_NAMES[normalized] || normalized;
}

/**
 * Check if role is Admin
 */
export function isAdmin(role: string | null | undefined): boolean {
  return normalizeRole(role) === 'ADMIN';
}

/**
 * Check if role is Teacher (Giảng viên)
 */
export function isTeacher(role: string | null | undefined): boolean {
  return normalizeRole(role) === 'GIANG_VIEN';
}

/**
 * Check if role is Class Monitor (Lớp trưởng)
 */
export function isMonitor(role: string | null | undefined): boolean {
  return normalizeRole(role) === 'LOP_TRUONG';
}

/**
 * Check if role is Student (Sinh viên)
 */
export function isStudent(role: string | null | undefined): boolean {
  return normalizeRole(role) === 'SINH_VIEN';
}

export default normalizeRole;
