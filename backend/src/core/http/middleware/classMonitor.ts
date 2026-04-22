/**
 * Class Monitor Middleware
 * Middleware to verify class monitor's class information and access
 * @module core/http/middleware/classMonitor
 */

import { Request, Response, NextFunction, RequestHandler } from 'express';
import { prisma } from '../../../data/infrastructure/prisma/client';
import { ApiResponse, sendResponse } from '../response/apiResponse';
import { logError } from '../../logger';

// Extend Express Request to include user and classMonitor
interface AuthRequest extends Request {
  user?: {
    sub?: string;
    id?: string;
  };
  classMonitor?: {
    lop_id: string;
    lop: {
      id: string;
      ten_lop: string;
      chu_nhiem: string | null;
      khoa: string | null;
      nien_khoa: string | null;
    };
  };
}

type ResourceType = 'registration' | 'student';

/**
 * Middleware to get and verify class monitor's class information
 * Adds `req.classMonitor` object with { lop_id, lop } to the request
 */
export const getMonitorClass: RequestHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<Response | void> => {
  try {
    const authReq = req as AuthRequest;
    const userId = authReq.user?.sub;

    if (!userId) {
      return sendResponse(res, 401, ApiResponse.error('Không xác định được người dùng'));
    }

    // Get monitor's class information
    const monitor = await prisma.sinhVien.findFirst({
      where: { nguoi_dung_id: userId },
      select: { 
        lop_id: true, 
        lop: { 
          select: { 
            id: true,
            ten_lop: true, 
            chu_nhiem: true,
            khoa: true,
            nien_khoa: true
          } 
        } 
      }
    });

    if (!monitor || !monitor.lop_id) {
      logError('Monitor not assigned to a class', null, { userId });
      return sendResponse(res, 403, ApiResponse.error('Bạn chưa được gán vào lớp nào'));
    }

    // Add class info to request for use in controllers
    authReq.classMonitor = {
      lop_id: monitor.lop_id,
      lop: monitor.lop!
    };

    next();
  } catch (error) {
    const authReq = req as AuthRequest;
    logError('Error in getMonitorClass middleware', error as Error, { userId: authReq.user?.sub });
    return sendResponse(res, 500, ApiResponse.error('Lỗi khi xác thực thông tin lớp'));
  }
};

/**
 * Middleware to verify that a resource (student, registration, etc.) belongs to monitor's class
 * Use after getMonitorClass middleware
 */
export const verifyClassAccess = (resourceType: ResourceType): RequestHandler => {
  return async (req: Request, res: Response, next: NextFunction): Promise<Response | void> => {
    try {
      const authReq = req as AuthRequest;
      const classId = authReq.classMonitor?.lop_id;
      
      if (!classId) {
        return sendResponse(res, 403, ApiResponse.error('Không xác định được lớp'));
      }

      // Check access based on resource type
      let hasAccess = false;

      switch (resourceType) {
        case 'registration': {
          const { registrationId } = req.params;
          const registration = await prisma.dangKyHoatDong.findUnique({
            where: { id: registrationId },
            include: { sinh_vien: { select: { lop_id: true } } }
          });
          hasAccess = registration !== null && registration.sinh_vien.lop_id === classId;
          if (!hasAccess) {
            logError('Monitor attempted to access registration outside their class', null, { 
              registrationId, 
              monitorClassId: classId,
              registrationClassId: registration?.sinh_vien?.lop_id
            });
          }
          break;
        }

        case 'student': {
          const { studentId } = req.params;
          const student = await prisma.sinhVien.findUnique({
            where: { id: studentId },
            select: { lop_id: true }
          });
          hasAccess = student !== null && student.lop_id === classId;
          if (!hasAccess) {
            logError('Monitor attempted to access student outside their class', null, { 
              studentId, 
              monitorClassId: classId,
              studentClassId: student?.lop_id
            });
          }
          break;
        }

        default:
          logError('Unknown resource type in verifyClassAccess', null, { resourceType });
          return sendResponse(res, 500, ApiResponse.error('Lỗi xác thực quyền truy cập'));
      }

      if (!hasAccess) {
        return sendResponse(res, 403, ApiResponse.error('Bạn không có quyền truy cập tài nguyên này'));
      }

      next();
    } catch (error) {
      const authReq = req as AuthRequest;
      logError('Error in verifyClassAccess middleware', error as Error, { 
        resourceType, 
        userId: authReq.user?.sub 
      });
      return sendResponse(res, 500, ApiResponse.error('Lỗi khi xác thực quyền truy cập'));
    }
  };
};
