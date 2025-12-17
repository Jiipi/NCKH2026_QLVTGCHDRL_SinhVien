/**
 * Dynamic Permission Middleware
 * Kiểm tra quyền từ database realtime - không cần reload hay login lại
 * Khi admin tắt quyền, user sẽ bị chặn ngay lập tức với 403
 * @module core/http/middleware/dynamicPermission
 */

import { Response, NextFunction } from 'express';
import { prisma } from '../../../data/infrastructure/prisma/client';
import { logError } from '../../logger';
import { AuthenticatedRequest } from './authJwt';

/**
 * Extended request with permissions
 */
export interface PermissionRequest extends AuthenticatedRequest {
  userPermissions?: string[];
}

/**
 * Cache entry for permissions
 */
interface PermissionCacheEntry {
  permissions: string[];
  timestamp: number;
}

// Cache quyền của user trong 5 giây để tránh query liên tục
const permissionsCache = new Map<string, PermissionCacheEntry>();
const CACHE_TTL = 0; // 0 = không cache (tắt cache để permissions mới có hiệu lực ngay)

/**
 * PERMISSION ALIASES - Bảng ánh xạ quyền tương đương
 */
export const PERMISSION_ALIASES: Record<string, string[]> = {
  // ============ NOTIFICATIONS ============
  'notifications.write': ['notification.write'],
  'notifications.read': ['notifications.view', 'notification.read'],
  'notifications.delete': ['notification.delete'],
  'notification.write': ['notifications.write'],
  'notification.read': ['notifications.read', 'notifications.view'],
  'notifications.create': [],

  // ============ ACTIVITIES ============
  'activities.write': ['activities.create', 'activities.update', 'activities.manage'],
  'activities.read': ['activities.view'],
  'activities.delete': ['activities.manage'],

  // ============ REGISTRATIONS ============
  'registrations.write': ['registrations.register', 'registrations.approve', 'registrations.reject', 'registrations.manage'],
  'registrations.read': ['registrations.view'],
  'registrations.delete': ['registrations.cancel', 'registrations.manage'],

  // ============ USERS ============
  'users.write': ['users.create', 'users.update', 'users.manage'],
  'users.read': ['users.view'],
  'users.delete': ['users.manage'],

  // ============ ATTENDANCE ============
  'attendance.write': ['attendance.manage', 'attendance.checkin'],
  'attendance.read': ['attendance.view'],

  // ============ REPORTS ============
  'reports.read': ['reports.view'],
  'reports.write': ['reports.export', 'reports.manage'],

  // ============ STUDENTS ============
  'students.write': ['students.update', 'students.manage'],
  'students.read': ['students.view'],

  // ============ ACTIVITY TYPES ============
  'activityTypes.write': ['activityTypes.create', 'activityTypes.update', 'activityTypes.manage'],
  'activityTypes.read': ['activityTypes.view'],

  // ============ PROFILE ============
  'profile.write': ['profile.update'],
  'profile.read': ['profile.view'],

  // ============ POINTS ============
  'points.read': ['points.view_own', 'points.view_all', 'points.view'],

  // ============ SYSTEM ============
  'system.write': ['system.manage', 'system.configure', 'system.settings'],
  'system.read': ['system.view', 'system.dashboard', 'system.logs'],

  // ============ CLASSMATES ============
  'classmates.write': ['classmates.assist', 'classmates.manage'],
  'classmates.read': ['classmates.view'],

  // ============ SEMESTERS ============
  'semesters.write': ['semesters.create', 'semesters.update', 'semesters.manage'],
  'semesters.read': ['semesters.view'],
};

/**
 * Lấy quyền của user từ database (có cache)
 */
export async function getUserPermissions(userId: string, forceRefresh: boolean = false): Promise<string[]> {
  const cacheKey = `user_${userId}`;

  // Nếu không force refresh, kiểm tra cache
  if (!forceRefresh && CACHE_TTL > 0) {
    const cached = permissionsCache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
      return cached.permissions;
    }
  } else if (forceRefresh) {
    permissionsCache.delete(cacheKey);
  }

  try {
    const user = await prisma.nguoiDung.findUnique({
      where: { id: userId },
      include: {
        vai_tro: {
          select: {
            ten_vt: true,
            quyen_han: true,
          },
        },
      },
    });

    if (!user || !user.vai_tro) {
      return [];
    }

    // Normalize quyen_han
    let permissions = user.vai_tro.quyen_han as unknown;

    if (permissions == null) {
      return [];
    }

    if (Array.isArray(permissions)) {
      return permissions as string[];
    }

    if (typeof permissions === 'string') {
      try {
        permissions = JSON.parse(permissions);
      } catch (e) {
        return [];
      }
    }

    if (typeof permissions === 'object') {
      const obj = permissions as Record<string, unknown>;
      if (Array.isArray(obj.permissions)) {
        permissions = obj.permissions;
      } else {
        permissions = Object.values(obj).filter(p => typeof p === 'string');
      }
    }

    const finalPermissions = Array.isArray(permissions) ? permissions as string[] : [];

    // Cache permissions
    if (CACHE_TTL > 0) {
      permissionsCache.set(cacheKey, {
        permissions: finalPermissions,
        timestamp: Date.now(),
      });
    }

    return finalPermissions;
  } catch (error) {
    logError('Error getting user permissions:', error as Error);
    return [];
  }
}

/**
 * Clear cache khi admin update quyền
 */
export function clearPermissionsCache(userId: string | null = null): void {
  if (userId) {
    permissionsCache.delete(`user_${userId}`);
  } else {
    permissionsCache.clear();
  }
}

/**
 * Kiểm tra user có quyền hay không (bao gồm aliases)
 */
export function checkPermissionWithAliases(userPermissions: string[], requiredPermission: string): boolean {
  // 1. Kiểm tra trực tiếp
  if (userPermissions.includes(requiredPermission)) return true;

  // 2. Kiểm tra quyền wildcard (admin có tất cả)
  if (userPermissions.includes('*')) return true;

  // 3. Kiểm tra resource wildcard (ví dụ: notifications.*)
  const [resource] = requiredPermission.split('.');
  if (userPermissions.includes(`${resource}.*`)) return true;

  // 4. Kiểm tra aliases đã định nghĩa
  const aliases = PERMISSION_ALIASES[requiredPermission] || [];
  for (const alias of aliases) {
    if (userPermissions.includes(alias)) return true;
  }

  // 5. Kiểm tra .read -> .view fallback (chỉ cho quyền đọc)
  if (requiredPermission.endsWith('.read')) {
    const viewPermission = requiredPermission.replace('.read', '.view');
    if (userPermissions.includes(viewPermission)) return true;
  }

  return false;
}

/**
 * Middleware kiểm tra quyền động - có hỗ trợ PERMISSION_ALIASES
 */
export function requireDynamicPermission(requiredPermission: string) {
  return async (req: PermissionRequest, res: Response, next: NextFunction): Promise<void | Response> => {
    try {
      if (!req.user || !req.user.sub) {
        return res.status(401).json({
          success: false,
          message: 'Chưa đăng nhập',
          code: 'UNAUTHORIZED',
        });
      }

      const userId = req.user.sub;
      const forceRefresh = req.query.refresh === 'true';
      const userPermissions = await getUserPermissions(userId, forceRefresh);
      const hasPermission = checkPermissionWithAliases(userPermissions, requiredPermission);

      if (!hasPermission) {
        clearPermissionsCache(userId);

        return res.status(403).json({
          success: false,
          message: `Bạn không có quyền ${requiredPermission}`,
          code: 'FORBIDDEN',
          requiredPermission,
          userPermissions,
          debug: process.env.NODE_ENV !== 'production' ? {
            userId,
            role: req.user?.role,
            permissionsCount: userPermissions.length,
            aliases: PERMISSION_ALIASES[requiredPermission] || []
          } : undefined
        });
      }

      req.userPermissions = userPermissions;
      next();
    } catch (error) {
      logError('Error in requireDynamicPermission:', error as Error);
      return res.status(500).json({
        success: false,
        message: 'Lỗi kiểm tra quyền',
        code: 'INTERNAL_ERROR',
      });
    }
  };
}

/**
 * Middleware kiểm tra nhiều quyền (có 1 trong các quyền là được)
 */
export function requireAnyPermission(requiredPermissions: string[]) {
  return async (req: PermissionRequest, res: Response, next: NextFunction): Promise<void | Response> => {
    try {
      if (!req.user || !req.user.sub) {
        return res.status(401).json({
          success: false,
          message: 'Chưa đăng nhập',
          code: 'UNAUTHORIZED',
        });
      }

      const userId = req.user.sub;
      const userPermissions = await getUserPermissions(userId);
      const hasAnyPermission = requiredPermissions.some(perm =>
        checkPermissionWithAliases(userPermissions, perm)
      );

      if (!hasAnyPermission) {
        return res.status(403).json({
          success: false,
          message: `Bạn cần một trong các quyền: ${requiredPermissions.join(', ')}`,
          code: 'FORBIDDEN',
          requiredPermissions,
          userPermissions,
        });
      }

      req.userPermissions = userPermissions;
      next();
    } catch (error) {
      logError('Error in requireAnyPermission:', error as Error);
      return res.status(500).json({
        success: false,
        message: 'Lỗi kiểm tra quyền',
        code: 'INTERNAL_ERROR',
      });
    }
  };
}

/**
 * Middleware kiểm tra tất cả quyền (phải có đủ tất cả)
 */
export function requireAllPermissions(requiredPermissions: string[]) {
  return async (req: PermissionRequest, res: Response, next: NextFunction): Promise<void | Response> => {
    try {
      if (!req.user || !req.user.sub) {
        return res.status(401).json({
          success: false,
          message: 'Chưa đăng nhập',
          code: 'UNAUTHORIZED',
        });
      }

      const userId = req.user.sub;
      const userPermissions = await getUserPermissions(userId);
      const hasAllPermissions = requiredPermissions.every(perm =>
        checkPermissionWithAliases(userPermissions, perm)
      );

      if (!hasAllPermissions) {
        const missingPermissions = requiredPermissions.filter(
          perm => !checkPermissionWithAliases(userPermissions, perm)
        );

        return res.status(403).json({
          success: false,
          message: `Bạn thiếu các quyền: ${missingPermissions.join(', ')}`,
          code: 'FORBIDDEN',
          requiredPermissions,
          missingPermissions,
          userPermissions,
        });
      }

      req.userPermissions = userPermissions;
      next();
    } catch (error) {
      logError('Error in requireAllPermissions:', error as Error);
      return res.status(500).json({
        success: false,
        message: 'Lỗi kiểm tra quyền',
        code: 'INTERNAL_ERROR',
      });
    }
  };
}
