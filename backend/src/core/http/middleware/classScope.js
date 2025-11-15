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

const { prisma } = require('../../../infrastructure/prisma/client');
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
      const context = req.context || {};

      // ADMIN: No scope restrictions
      if (role === 'ADMIN') {
        req.scope = { isAdmin: true };
        return next();
      }

      // Initialize scope object
      req.scope = {};

      // SINH_VIEN or LOP_TRUONG: Filter by their class
      if ((role === 'SINH_VIEN' || role === 'LOP_TRUONG') && context.classId) {
        req.scope.classId = context.classId;
        req.scope.className = context.className;
        
        // For activities: filter by nguoi_tao_id (must be class creators)
        // Get class creators (all students in class + homeroom teacher)
        const classStudents = await prisma.sinhVien.findMany({
          where: { lop_id: context.classId },
          select: { nguoi_dung_id: true }
        });
        const classCreatorUserIds = classStudents.map(s => s.nguoi_dung_id).filter(Boolean);
        
        // Get homeroom teacher
        const lop = await prisma.lop.findUnique({
          where: { id: context.classId },
          select: { chu_nhiem: true }
        });
        if (lop?.chu_nhiem) {
          classCreatorUserIds.push(lop.chu_nhiem);
        }
        
        if (classCreatorUserIds.length > 0) {
          req.scope.activityFilter = {
            nguoi_tao_id: { in: classCreatorUserIds }
          };
        } else {
          // No class creators -> see nothing
          req.scope.activityFilter = { id: { equals: 'NEVER_MATCH' } };
        }

        // For registrations: filter by student's class
        if (options.filterRegistrations !== false) {
          req.scope.registrationFilter = {
            sinh_vien: {
              lop_id: context.classId,
            },
          };
        }
      }

      // GIANG_VIEN: Filter by classes they teach
      if (role === 'GIANG_VIEN' && context.teacherOf && context.teacherOf.length > 0) {
        req.scope.teacherOf = context.teacherOf;
        
        // For activities: filter by nguoi_tao_id (must be class creators of their classes)
        // Get all students in teacher's classes
        const students = await prisma.sinhVien.findMany({
          where: { lop_id: { in: context.teacherOf } },
          select: { nguoi_dung_id: true }
        });
        const studentUserIds = students.map(s => s.nguoi_dung_id).filter(Boolean);
        
        // Add teacher's own user ID
        const classCreators = [...studentUserIds, req.user.sub].filter(Boolean);
        
        if (classCreators.length > 0) {
          req.scope.activityFilter = {
            nguoi_tao_id: { in: classCreators }
          };
        } else {
          req.scope.activityFilter = { id: { equals: 'NEVER_MATCH' } };
        }

        // For classes: only classes they teach
        req.scope.classFilter = {
          id: { in: context.teacherOf },
        };
      }

      next();
    } catch (error) {
      logError('Apply class scope error', error);
      // On error, deny access to be safe
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
