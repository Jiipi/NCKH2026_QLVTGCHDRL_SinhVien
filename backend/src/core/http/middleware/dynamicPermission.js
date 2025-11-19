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
const CACHE_TTL = 0; // 0 = không cache (tắt cache để test permissions mới)

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

    // Normalize quyen_han: có thể là array hoặc object
    let permissions = user.vai_tro.quyen_han || [];
    const originalType = typeof permissions;
    const wasArray = Array.isArray(permissions);
    
    // Nếu là object, chuyển thành array
    if (permissions && typeof permissions === 'object' && !Array.isArray(permissions)) {
      // Nếu có property 'permissions', lấy nó
      if (Array.isArray(permissions.permissions)) {
        permissions = permissions.permissions;
      } else {
        // Nếu không, lấy tất cả values
        permissions = Object.values(permissions);
      }
    }
    
    // Đảm bảo là array
    if (!Array.isArray(permissions)) {
      permissions = [];
    }
    
    // Log normalization nếu cần (chỉ khi có vấn đề)
    if (!wasArray && permissions.length > 0) {
      console.log('[Permission Normalize]', {
        userId,
        originalType,
        wasArray,
        normalizedCount: permissions.length,
        sample: permissions.slice(0, 3)
      });
    }
    
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
      
      // Kiểm tra xem có yêu cầu force refresh không (query param ?refresh=true)
      const forceRefresh = req.query.refresh === 'true';
      
      // Lấy quyền từ database
      const userPermissions = await getUserPermissions(userId, forceRefresh);

      // Debug logging (chỉ trong development) - luôn log cho attendance.write
      if (requiredPermission === 'attendance.write') {
        console.log('[Permission Debug]', {
          userId,
          requiredPermission,
          userPermissions,
          permissionsCount: userPermissions.length,
          hasPermission: userPermissions.includes(requiredPermission),
          role: req.user?.role
        });
      }

      // Kiểm tra quyền trực tiếp
      let hasPermission = userPermissions.includes(requiredPermission);
      
      // Nếu không có quyền, kiểm tra backward compatibility:
      // 1. Nếu yêu cầu .read nhưng user có .view thì cũng chấp nhận
      if (!hasPermission && requiredPermission.endsWith('.read')) {
        const viewPermission = requiredPermission.replace('.read', '.view');
        hasPermission = userPermissions.includes(viewPermission);
      }
      
      // 2. Nếu yêu cầu registrations.write nhưng user có registrations.register thì cũng chấp nhận
      if (!hasPermission && requiredPermission === 'registrations.write') {
        hasPermission = userPermissions.includes('registrations.register');
      }

      if (!hasPermission) {
        // Clear cache để force refresh permissions từ database
        clearPermissionsCache(userId);
        
        // Log để debug (luôn log cho attendance.write)
        if (requiredPermission === 'attendance.write' || process.env.NODE_ENV !== 'production') {
          console.log('[Permission Denied]', {
            userId,
            requiredPermission,
            userPermissions,
            permissionsCount: userPermissions.length,
            role: req.user?.role,
            hasAttendanceView: userPermissions.includes('attendance.view'),
            hasAttendanceMark: userPermissions.includes('attendance.mark'),
            hasAttendanceWrite: userPermissions.includes('attendance.write')
          });
        }
        
        return res.status(403).json({
          success: false,
          message: `Bạn không có quyền ${requiredPermission}`,
          code: 'FORBIDDEN',
          requiredPermission,
          userPermissions, // Để debug
          debug: process.env.NODE_ENV !== 'production' ? {
            userId,
            role: req.user?.role,
            permissionsCount: userPermissions.length
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
