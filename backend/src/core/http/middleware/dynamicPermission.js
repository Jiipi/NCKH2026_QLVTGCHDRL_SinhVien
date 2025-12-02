/**
 * Dynamic Permission Middleware
 * Kiểm tra quyền từ database realtime - không cần reload hay login lại
 * Khi admin tắt quyền, user sẽ bị chặn ngay lập tức với 403
 */

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const { logError } = require('../../logger');

// Cache quyền của user trong 5 giây để tránh query liên tục
const permissionsCache = new Map();
const CACHE_TTL = 0; // 0 = không cache (tắt cache để permissions mới có hiệu lực ngay)

/**
 * Lấy quyền của user từ database (có cache)
 */
async function getUserPermissions(userId, forceRefresh = false) {
  const cacheKey = `user_${userId}`;
  
  // Nếu không force refresh, kiểm tra cache
  if (!forceRefresh) {
    const cached = permissionsCache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
      return cached.permissions;
    }
  } else {
    // Force refresh: xóa cache
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

    // Normalize quyen_han: Prisma Json type có thể trả về array, object, hoặc null
    let permissions = user.vai_tro.quyen_han;
    
    // Nếu null hoặc undefined, trả về array rỗng
    if (permissions == null) {
      return [];
    }
    
    // Nếu đã là array, trả về luôn
    if (Array.isArray(permissions)) {
      return permissions;
    }
    
    // Nếu là string, parse JSON
    if (typeof permissions === 'string') {
      try {
        permissions = JSON.parse(permissions);
      } catch (e) {
        return [];
      }
    }
    
    // Nếu là object, chuyển thành array
    if (typeof permissions === 'object') {
      // Nếu có property 'permissions', lấy nó
      if (Array.isArray(permissions.permissions)) {
        permissions = permissions.permissions;
      } else {
        // Nếu không, lấy tất cả values (loại bỏ keys không phải string)
        permissions = Object.values(permissions).filter(p => typeof p === 'string');
      }
    }
    
    // Đảm bảo là array
    return Array.isArray(permissions) ? permissions : [];
    
    // Cache permissions
    permissionsCache.set(cacheKey, {
      permissions,
      timestamp: Date.now(),
    });

    return permissions;
  } catch (error) {
    logError('Error getting user permissions:', error);
    return [];
  }
}

/**
 * Clear cache khi admin update quyền
 */
function clearPermissionsCache(userId = null) {
  if (userId) {
    permissionsCache.delete(`user_${userId}`);
  } else {
    permissionsCache.clear();
  }
}

/**
 * PERMISSION ALIASES - Bảng ánh xạ quyền tương đương
 * 
 * Khi route yêu cầu quyền X, user có thể dùng quyền Y nếu được định nghĩa ở đây.
 * Format: requiredPermission -> [list of acceptable alternatives]
 */
const PERMISSION_ALIASES = {
  // ============ NOTIFICATIONS ============
  // CHỈ dùng aliases cho backward compatibility (số ít/số nhiều)
  // KHÔNG dùng aliases cho quyền riêng biệt - admin phải bật/tắt từng quyền cụ thể
  'notifications.write': ['notification.write'],  // Chỉ alias số ít/số nhiều
  'notifications.read': ['notifications.view', 'notification.read'],
  'notifications.delete': ['notification.delete'],
  'notification.write': ['notifications.write'],
  'notification.read': ['notifications.read', 'notifications.view'],
  'notifications.create': [],  // Quyền riêng, không có alias

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
 * Kiểm tra user có quyền hay không (bao gồm aliases)
 * 
 * Logic:
 * 1. Kiểm tra quyền trực tiếp
 * 2. Kiểm tra wildcard (*) cho admin
 * 3. Kiểm tra resource wildcard (resource.*)
 * 4. Kiểm tra aliases đã định nghĩa trong PERMISSION_ALIASES
 * 5. Fallback .read -> .view (chỉ cho đọc)
 * 
 * LƯU Ý: KHÔNG tự động fallback .write -> .create/.update/.manage
 * Admin phải bật từng quyền cụ thể trong giao diện quản lý
 */
function checkPermissionWithAliases(userPermissions, requiredPermission) {
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

  // KHÔNG tự động fallback .write -> .create/.update/.manage
  // Admin phải bật từng quyền cụ thể

  return false;
}

/**
 * Middleware kiểm tra quyền động - có hỗ trợ PERMISSION_ALIASES
 */
function requireDynamicPermission(requiredPermission) {
  return async (req, res, next) => {
    try {
      // Phải có user từ auth middleware
      if (!req.user || !req.user.sub) {
        return res.status(401).json({
          success: false,
          message: 'Chưa đăng nhập',
          code: 'UNAUTHORIZED',
        });
      }

      const userId = req.user.sub;
      
      // Kiểm tra xem có yêu cầu force refresh không (query param ?refresh=true)
      const forceRefresh = req.query.refresh === 'true';
      
      // Lấy quyền từ database
      const userPermissions = await getUserPermissions(userId, forceRefresh);

      // Kiểm tra quyền với hệ thống aliases
      const hasPermission = checkPermissionWithAliases(userPermissions, requiredPermission);

      if (!hasPermission) {
        // Clear cache để force refresh permissions từ database
        clearPermissionsCache(userId);
        
        return res.status(403).json({
          success: false,
          message: `Bạn không có quyền ${requiredPermission}`,
          code: 'FORBIDDEN',
          requiredPermission,
          userPermissions, // Để debug
          debug: process.env.NODE_ENV !== 'production' ? {
            userId,
            role: req.user?.role,
            permissionsCount: userPermissions.length,
            aliases: PERMISSION_ALIASES[requiredPermission] || []
          } : undefined
        });
      }

      // Attach permissions vào request để controller có thể dùng
      req.userPermissions = userPermissions;
      next();
    } catch (error) {
      logError('Error in requireDynamicPermission:', error);
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
 * Usage: requireAnyPermission(['profile.read', 'profile.update'])
 */
function requireAnyPermission(requiredPermissions) {
  return async (req, res, next) => {
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

      // Kiểm tra có ít nhất 1 quyền (với aliases)
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
      logError('Error in requireAnyPermission:', error);
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
 * Usage: requireAllPermissions(['users.read', 'users.write'])
 */
function requireAllPermissions(requiredPermissions) {
  return async (req, res, next) => {
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

      // Kiểm tra có đủ tất cả quyền (với aliases)
      const hasAllPermissions = requiredPermissions.every(perm => 
        checkPermissionWithAliases(userPermissions, perm)
      );

      if (!hasAllPermissions) {
        const missingPermissions = requiredPermissions.filter(
          perm => !userPermissions.includes(perm)
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
      logError('Error in requireAllPermissions:', error);
      return res.status(500).json({
        success: false,
        message: 'Lỗi kiểm tra quyền',
        code: 'INTERNAL_ERROR',
      });
    }
  };
}

module.exports = {
  requireDynamicPermission,
  requireAnyPermission,
  requireAllPermissions,
  clearPermissionsCache,
  getUserPermissions,
  checkPermissionWithAliases,
  PERMISSION_ALIASES,
};
