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
 * @module core/http/middleware/classScope
 */

import { Request, Response, NextFunction, RequestHandler } from 'express';
import type { Prisma } from '@prisma/client';
import { prisma } from '../../../data/infrastructure/prisma/client';
import { logInfo, logError } from '../../logger';

// Extend Express Request to include context
interface ClassContext {
  classId?: string;
  className?: string;
  lopTruongOf?: string[];
  teacherOf?: string[];
  teacherClasses?: Array<{ id: string; ten_lop: string; khoa: string | null }>;
}

interface ClassScope {
  isAdmin?: boolean;
  classId?: string;
  className?: string;
  lopTruongOf?: string[];
  teacherOf?: string[];
  activityFilter?: Prisma.HoatDongWhereInput;
  registrationFilter?: Prisma.DangKyHoatDongWhereInput;
  classFilter?: Prisma.LopWhereInput;
}

interface AuthRequest extends Request {
  user?: {
    sub?: string;
    id?: string;
    role?: string;
  };
  context?: ClassContext;
  scope?: ClassScope;
}

interface ApplyScopeOptions {
  filterRegistrations?: boolean;
}

/**
 * Extract class information for the authenticated user
 * Adds to req.context:
 * - classId: User's class ID
 * - className: User's class name
 * - lopTruongOf: Array of class IDs if user is a monitor
 * - teacherOf: Array of class IDs if user is a teacher
 */
export const extractClassContext: RequestHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authReq = req as AuthRequest;
    if (!authReq.user || !authReq.user.sub) {
      return next();
    }

    const userId = authReq.user.sub;
    const role = authReq.user.role;

    // Initialize context if not exists
    if (!authReq.context) {
      authReq.context = {};
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
        authReq.context.classId = sinhVien.lop_id;
        authReq.context.className = sinhVien.lop?.ten_lop;

        // If LOP_TRUONG, also get students in their class
        if (role === 'LOP_TRUONG') {
          authReq.context.lopTruongOf = [sinhVien.lop_id];
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
        authReq.context.teacherOf = classes.map(c => c.id);
        authReq.context.teacherClasses = classes;
      }
    }

    next();
  } catch (error) {
    logError('Extract class context error', error as Error);
    // Don't block the request, just continue without context
    next();
  }
};

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
export function applyClassScope(options: ApplyScopeOptions = {}): RequestHandler {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const authReq = req as AuthRequest;
      const role = authReq.user?.role;
      const context = authReq.context || {};

      // ADMIN: No scope restrictions
      if (role === 'ADMIN') {
        authReq.scope = { isAdmin: true };
        return next();
      }

      // Initialize scope object
      authReq.scope = {};

      // SINH_VIEN: Thấy hoạt động đã duyệt/kết thúc của lớp + hoạt động toàn trường
      if (role === 'SINH_VIEN' && context.classId) {
        authReq.scope.classId = context.classId;
        authReq.scope.className = context.className;

        authReq.scope.activityFilter = {
          OR: [
            { lop_id: context.classId },
            { lop_id: null }
          ],
          trang_thai: { in: ['da_duyet', 'ket_thuc'] }
        };

        if (options.filterRegistrations !== false) {
          authReq.scope.registrationFilter = {
            sinh_vien: {
              lop_id: context.classId,
            },
          };
        }
      }

      // LOP_TRUONG: Thấy tất cả hoạt động của lớp (bao gồm cho_duyet để theo dõi)
      if (role === 'LOP_TRUONG' && context.classId) {
        authReq.scope.classId = context.classId;
        authReq.scope.className = context.className;
        authReq.scope.lopTruongOf = context.lopTruongOf;

        // LT cần thấy cả cho_duyet để theo dõi hoạt động đã tạo
        authReq.scope.activityFilter = {
          OR: [
            { lop_id: context.classId },
            { lop_id: null }
          ]
          // Không filter trang_thai - LT thấy tất cả hoạt động của lớp
        };

        if (options.filterRegistrations !== false) {
          authReq.scope.registrationFilter = {
            sinh_vien: {
              lop_id: context.classId,
            },
          };
        }
      }

      // GIANG_VIEN: Thấy hoạt động đã duyệt/kết thúc của lớp phụ trách
      if (role === 'GIANG_VIEN' && context.teacherOf && context.teacherOf.length > 0) {
        authReq.scope.teacherOf = context.teacherOf;

        // GV thấy hoạt động đã duyệt/kết thúc (giống SV/LT)
        // Hoạt động cho_duyet được đếm riêng ở mục "Chờ phê duyệt"
        authReq.scope.activityFilter = {
          lop_id: { in: context.teacherOf },
          trang_thai: { in: ['da_duyet', 'ket_thuc'] }
        };

        authReq.scope.classFilter = {
          id: { in: context.teacherOf },
        };
      }

      next();
    } catch (error) {
      logError('Apply class scope error', error as Error);
      (req as AuthRequest).scope = { activityFilter: { id: { equals: 'NEVER_MATCH' } } };
      next();
    }
  };
}

/**
 * Require user to have a class
 * Returns 403 if student/monitor doesn't belong to a class
 */
export const requireClass: RequestHandler = (
  req: Request,
  res: Response,
  next: NextFunction
): void | Response => {
  const authReq = req as AuthRequest;
  const role = authReq.user?.role;
  const context = authReq.context || {};

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
};

/**
 * Check if user can access specific class data
 */
export function canAccessClass(classId: string): RequestHandler {
  return (req: Request, res: Response, next: NextFunction): void | Response => {
    const authReq = req as AuthRequest;
    const role = authReq.user?.role;
    const context = authReq.context || {};

    // Admin: full access
    if (role === 'ADMIN') {
      return next();
    }

    // Student/Monitor: must be their class
    if (role === 'SINH_VIEN' || role === 'LOP_TRUONG') {
      if (context.classId !== classId) {
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
      if (!context.teacherOf || !context.teacherOf.includes(classId)) {
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
