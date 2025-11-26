/**
 * Class-based Access Control Middleware
 * 
 * Enforces data isolation based on user's class:
 * - SINH_VIEN: Only see activities/registrations from their class
 * - LOP_TRUONG: Only manage their class's data
 * - GIANG_VIEN: Only see classes they teach
 * - ADMIN: Full access
 * 
 * This middleware extracts user's classId and adds scope to req.context
 */

const { prisma } = require('../../../data/infrastructure/prisma/client');
const { logInfo, logError } = require('../../logger');

/**
 * Extract class information for the authenticated user
 * Adds to req.context:
 * - classId: User's class ID
 * - className: User's class name
 * - lopTruongOf: Array of class IDs if user is a monitor
 * - teacherOf: Array of class IDs if user is a teacher
 */
async function extractClassContext(req, res, next) {
  try {
    if (!req.user || !req.user.sub) {
      return next();
    }

    const userId = req.user.sub;
    const role = req.user.role;

    // Initialize context if not exists
    if (!req.context) {
      req.context = {};
    }

    // SINH_VIEN or LOP_TRUONG: Get their class
    if (role === 'SINH_VIEN' || role === 'LOP_TRUONG') {
      const sinhVien = await prisma.sinhVien.findUnique({
        where: { nguoi_dung_id: userId },
        include: {
          lop: {
            select: {
              id: true,
              ten_lop: true,
              khoa: true
            }
          }
        }
      });

      if (sinhVien && sinhVien.lop_id) {
        req.context.classId = sinhVien.lop_id;
        req.context.className = sinhVien.lop?.ten_lop;

        // If LOP_TRUONG, also get students in their class
        if (role === 'LOP_TRUONG') {
          req.context.lopTruongOf = [sinhVien.lop_id];
        }
      }
    }

    // GIANG_VIEN: Get classes they teach (chu_nhiem field)
    if (role === 'GIANG_VIEN') {
      const classes = await prisma.lop.findMany({
        where: { chu_nhiem: userId },
        select: {
          id: true,
          ten_lop: true,
          khoa: true
        },
      });

      if (classes.length > 0) {
        req.context.teacherOf = classes.map(c => c.id);
        req.context.teacherClasses = classes;
      }
    }

    next();
  } catch (error) {
    logError('Extract class context error', error);
    // Don't block the request, just continue without context
    next();
  }
}

/**
 * Apply class-based scope to queries
 * Must be used after extractClassContext
 * 
 * Adds scope filters based on role:
 * - Students: only their class activities
 * - Monitors: only their class activities + registrations
 * - Teachers: only classes they teach
 * - Admin: no scope (full access)
 */
function applyClassScope(options = {}) {
  return async (req, res, next) => {
    try {
      const role = req.user?.role;
      const userId = req.user?.sub;
      const context = req.context || {};

      // ADMIN: No scope restrictions
      if (role === 'ADMIN') {
        req.scope = { isAdmin: true };
        return next();
      }

      // Initialize scope object
      req.scope = {};

      // SINH_VIEN: Chỉ thấy hoạt động đã duyệt/kết thúc của lớp
      if (role === 'SINH_VIEN' && context.classId) {
        req.scope.classId = context.classId;
        req.scope.className = context.className;
        
        req.scope.activityFilter = {
          lop_id: context.classId,
          trang_thai: { in: ['da_duyet', 'ket_thuc'] }
        };

        if (options.filterRegistrations !== false) {
          req.scope.registrationFilter = {
            sinh_vien: {
              lop_id: context.classId,
            },
          };
        }
      }

      // LOP_TRUONG: Thấy tất cả hoạt động của lớp (bao gồm cho_duyet để theo dõi)
      if (role === 'LOP_TRUONG' && context.classId) {
        req.scope.classId = context.classId;
        req.scope.className = context.className;
        req.scope.lopTruongOf = context.lopTruongOf;
        
        // LT cần thấy cả cho_duyet để theo dõi hoạt động đã tạo
        req.scope.activityFilter = {
          lop_id: context.classId
          // Không filter trang_thai - LT thấy tất cả hoạt động của lớp
        };

        if (options.filterRegistrations !== false) {
          req.scope.registrationFilter = {
            sinh_vien: {
              lop_id: context.classId,
            },
          };
        }
      }

      // GIANG_VIEN: Thấy TẤT CẢ hoạt động của lớp phụ trách (bao gồm cho_duyet để duyệt)
      if (role === 'GIANG_VIEN' && context.teacherOf && context.teacherOf.length > 0) {
        req.scope.teacherOf = context.teacherOf;
        
        // GV cần thấy cả hoạt động cho_duyet để duyệt
        req.scope.activityFilter = {
          lop_id: { in: context.teacherOf }
          // Không filter trang_thai - GV thấy tất cả
        };

        req.scope.classFilter = {
          id: { in: context.teacherOf },
        };
      }

      next();
    } catch (error) {
      logError('Apply class scope error', error);
      req.scope = { activityFilter: { id: { equals: 'NEVER_MATCH' } } };
      next();
    }
  };
}

/**
 * Require user to have a class
 * Returns 403 if student/monitor doesn't belong to a class
 */
function requireClass(req, res, next) {
  const role = req.user?.role;
  const context = req.context || {};

  // Only enforce for students and monitors
  if (role === 'SINH_VIEN' || role === 'LOP_TRUONG') {
    if (!context.classId) {
      return res.status(403).json({
        success: false,
        message: 'Bạn chưa được gán vào lớp. Vui lòng liên hệ quản trị viên.',
        statusCode: 403,
      });
    }
  }

  next();
}

/**
 * Check if user can access specific class data
 */
function canAccessClass(classId) {
  return (req, res, next) => {
    const role = req.user?.role;
    const context = req.context || {};

    // Admin: full access
    if (role === 'ADMIN') {
      return next();
    }

    // Student/Monitor: must be their class
    if (role === 'SINH_VIEN' || role === 'LOP_TRUONG') {
      if (context.classId !== parseInt(classId)) {
        return res.status(403).json({
          success: false,
          message: 'Bạn không có quyền truy cập lớp này',
          statusCode: 403,
        });
      }
      return next();
    }

    // Teacher: must be a class they teach
    if (role === 'GIANG_VIEN') {
      if (!context.teacherOf || !context.teacherOf.includes(parseInt(classId))) {
        return res.status(403).json({
          success: false,
          message: 'Bạn không phụ trách lớp này',
          statusCode: 403,
        });
      }
      return next();
    }

    // Default: deny
    return res.status(403).json({
      success: false,
      message: 'Không có quyền truy cập',
      statusCode: 403,
    });
  };
}

module.exports = {
  extractClassContext,
  applyClassScope,
  requireClass,
  canAccessClass,
};
