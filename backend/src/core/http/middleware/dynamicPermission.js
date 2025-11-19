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
const CACHE_TTL = 5000; // 5 seconds

/**
 * Lấy quyền của user từ database (có cache)
 */
async function getUserPermissions(userId) {
  const cacheKey = `user_${userId}`;
  const cached = permissionsCache.get(cacheKey);
  
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    return cached.permissions;
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

    const permissions = user.vai_tro.quyen_han || [];
    
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
 * Middleware kiểm tra quyền động
 * Usage: requireDynamicPermission('profile.read')
 * 
 * Quyền theo format: <resource>.<action>
 * Ví dụ:
 * - profile.read
 * - profile.update
 * - activities.read
 * - activities.write
 * - activities.delete
 * - activities.approve
 * - registrations.read
 * - registrations.write
 * - registrations.delete
 * - attendance.read
 * - attendance.write
 * - attendance.delete
 * - reports.read
 * - reports.export
 * - notifications.read
 * - notifications.write
 * - notifications.delete
 * - students.read
 * - students.update
 * - classmates.read
 * - classmates.assist
 * - scores.read
 * - roles.read
 * - roles.write
 * - roles.delete
 * - system.manage
 * - system.configure
 * - activityTypes.read
 * - activityTypes.write
 * - activityTypes.delete
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
      
      // Lấy quyền từ database
      const userPermissions = await getUserPermissions(userId);

      // Kiểm tra quyền
      const hasPermission = userPermissions.includes(requiredPermission);

      if (!hasPermission) {
        return res.status(403).json({
          success: false,
          message: `Bạn không có quyền ${requiredPermission}`,
          code: 'FORBIDDEN',
          requiredPermission,
          userPermissions, // Để debug
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

      // Kiểm tra có ít nhất 1 quyền
      const hasAnyPermission = requiredPermissions.some(perm => 
        userPermissions.includes(perm)
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

      // Kiểm tra có đủ tất cả quyền
      const hasAllPermissions = requiredPermissions.every(perm => 
        userPermissions.includes(perm)
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
};
