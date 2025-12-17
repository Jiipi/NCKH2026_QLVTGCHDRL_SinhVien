/**
 * Request Context Middleware
 * Attaches contextual information to the request object
 * This includes user ID, class ID, role, semester ID, etc.
 * @module core/http/middleware/requestContext
 */

import { Request, Response, NextFunction } from 'express';
import { logError } from '../../logger';
import { prisma } from '../../../data/infrastructure/prisma/client';
import { AuthenticatedRequest } from './authJwt';

/**
 * Request context interface
 */
export interface RequestContext {
  userId: string | null;
  userRole: string | null;
  tabId: string | null;
  classId: string | null;
  className: string | null;
  classCode?: string | null;
  semesterId: string | null;
  semesterName?: string | null;
  studentId?: string | null;
  teacherId?: string | null;
  isAdmin: boolean;
  isTeacher: boolean;
  isMonitor: boolean;
  isStudent: boolean;
}

/**
 * Request with context
 */
export interface ContextualRequest extends AuthenticatedRequest {
  context?: RequestContext;
}

/**
 * Attach request context
 * Enriches req with user context, class info, etc.
 */
export async function requestContext(
  req: ContextualRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    // Initialize context object
    req.context = {
      userId: req.user?.sub || null,
      userRole: req.user?.role || null,
      tabId: req.user?.tabId || (req.headers['x-tab-id'] as string) || null,
      classId: null,
      className: null,
      semesterId: null,
      isAdmin: req.user?.role === 'ADMIN',
      isTeacher: ['GIANG_VIEN', 'ADMIN'].includes(req.user?.role || ''),
      isMonitor: ['LOP_TRUONG', 'GIANG_VIEN', 'ADMIN'].includes(req.user?.role || ''),
      isStudent: req.user?.role === 'SINH_VIEN',
    };

    // If user is authenticated, try to get class info
    if (req.context.userId && !req.context.isAdmin) {
      try {
        // For students and monitors, get their class
        const student = await prisma.sinhVien.findUnique({
          where: { nguoi_dung_id: req.context.userId },
          include: {
            lop: {
              select: {
                id: true,
                ten_lop: true,
              },
            },
          },
        });

        if (student && student.lop) {
          req.context.classId = student.lop.id;
          req.context.className = student.lop.ten_lop;
          req.context.studentId = student.id;
        }

        // For teachers, we skip the class fetch since giangVien model doesn't exist
        // Teacher class association would be through their chu_nhiem relationship on Lop
      } catch (error) {
        logError('Failed to fetch user class context', error as Error);
        // Continue without class info
      }
    }

    // Note: Active semester lookup is disabled since hocKy model may not exist
    // Semester context can be obtained from query parameters or other means
    // if (req.context) {
    //   req.context.semesterId = null;
    //   req.context.semesterName = null;
    // }

    next();
  } catch (error) {
    logError('Request context middleware error', error as Error);
    // Don't block request if context fails
    req.context = {
      userId: req.user?.sub || null,
      userRole: req.user?.role || null,
      tabId: null,
      classId: null,
      className: null,
      semesterId: null,
      isAdmin: false,
      isTeacher: false,
      isMonitor: false,
      isStudent: false,
    };
    next();
  }
}

/**
 * Require class context
 * Ensures user has a class associated
 */
export function requireClassContext(
  req: ContextualRequest,
  res: Response,
  next: NextFunction
): void | Response {
  if (!req.context || !req.context.classId) {
    return res.status(400).json({
      success: false,
      message: 'Không tìm thấy thông tin lớp của bạn',
    });
  }
  next();
}
