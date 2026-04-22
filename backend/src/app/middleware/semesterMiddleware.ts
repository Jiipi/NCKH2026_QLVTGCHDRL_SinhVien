/**
 * Semester Validation Middleware
 * Validates semester access and injects parsed semester into request
 * @module app/middleware/semesterMiddleware
 */

import { Request, Response, NextFunction } from 'express';
import { parseSemesterString, getCurrentSemester } from '../../core/utils/semester';
import { SemesterClosureService } from '../../business/services/semesterClosure.service';
import { ApiResponse, sendResponse } from '../../core/http/response/apiResponse';
import { logError } from '../../core/logger';
import type { SemesterInfo } from '../../core/utils/semester';

/**
 * Semester context attached to request
 */
export interface SemesterContext {
  hoc_ky: string;      // 'hoc_ky_1' or 'hoc_ky_2'
  nam_hoc: string;     // '2025' (normalized single year)
  key: string;         // 'hoc_ky_1_2025' (composite key)
}

/**
 * Extended request with user and semester
 */
export interface AuthenticatedRequest extends Request {
  user?: {
    sub: string;       // User ID
    role: string;      // User role
  };
  semester?: SemesterContext;
}

/**
 * Validate and inject semester middleware
 * 
 * Logic:
 * 1. Extract semester from query params (semester or semesterValue)
 * 2. If no semester provided, use current semester
 * 3. Parse semester string using parseSemesterString()
 * 4. Validate format: hoc_ky_[12]_YYYY
 * 5. Check access control:
 *    - READ operations (GET): All users can access any semester (for viewing historical data)
 *    - WRITE operations (POST/PUT/PATCH/DELETE): Only current semester (or admin can access any)
 * 6. Check semester lock status for write operations using SemesterClosureService
 *    - Converts single year format (2025) to double year format (2025-2026 or 2024-2025)
 *    - Gets user's class ID automatically via enforceWritableForUserSemesterOrThrow
 *    - Returns 423 SEMESTER_LOCKED if locked
 * 7. Inject req.semester with parsed data
 * 
 * @returns Express middleware function
 */
export function validateAndInjectSemester() {
  return async (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void | Response> => {
    try {
      // Extract semester from query params
      const semesterParam = (req.query.semester || req.query.semesterValue) as string | undefined;

      // Parse semester or use current
      let semesterInfo: SemesterInfo | null;

      if (semesterParam) {
        // Validate format
        semesterInfo = parseSemesterString(semesterParam);

        if (!semesterInfo || !semesterInfo.value) {
          return sendResponse(
            res,
            400,
            ApiResponse.error(
              'Semester must be in format: hoc_ky_1_2025 or hoc_ky_2_2025',
              400,
              { code: 'INVALID_SEMESTER_FORMAT' }
            )
          );
        }
      } else {
        // Use current semester if not provided
        semesterInfo = getCurrentSemester();
      }

      // Check semester access control
      const userRole = req.user?.role?.toUpperCase();
      const currentSemester = getCurrentSemester();

      // Access control logic:
      // - READ operations (GET): All users can access any semester (for viewing historical data)
      // - WRITE operations (POST/PUT/PATCH/DELETE): Only current semester or admin
      const isWriteOperation = ['POST', 'PUT', 'PATCH', 'DELETE'].includes(req.method);

      if (isWriteOperation && userRole !== 'ADMIN' && semesterInfo.value !== currentSemester.value) {
        return sendResponse(
          res,
          403,
          ApiResponse.error(
            'Bạn chỉ có thể chỉnh sửa dữ liệu của học kỳ hiện tại',
            403,
            { code: 'SEMESTER_WRITE_DENIED' }
          )
        );
      }

      // Check semester lock status for write operations
      // Only check for POST, PUT, PATCH, DELETE methods
      if (isWriteOperation && userRole !== 'ADMIN') {
        try {
          const userId = req.user?.sub;

          if (userId && semesterInfo.year) {
            // Convert single year format to double year format for SemesterClosureService
            // Single: '2025' -> Double: '2025-2026' (for hoc_ky_1) or '2024-2025' (for hoc_ky_2)
            const year = parseInt(semesterInfo.year, 10);
            const doubleYearFormat = semesterInfo.semester === 'hoc_ky_1'
              ? `${year}-${year + 1}`
              : `${year - 1}-${year}`;

            // Check if semester is locked for this user
            // This will throw an error if semester is locked
            await SemesterClosureService.enforceWritableForUserSemesterOrThrow({
              userId,
              hoc_ky: semesterInfo.semester,
              nam_hoc: doubleYearFormat,
              userRole
            });
          }
        } catch (error) {
          const err = error as Error & { status?: number; details?: unknown };

          if (err.status === 423) {
            return sendResponse(
              res,
              423,
              ApiResponse.error(
                'Học kỳ này đã bị khóa',
                423,
                { code: 'SEMESTER_LOCKED', ...(err.details ? { details: err.details } : {}) }
              )
            );
          }

          // Log unexpected errors but don't block the request
          logError('Semester lock check failed', err);
        }
      }

      // Inject semester context into request
      req.semester = {
        hoc_ky: semesterInfo.semester,
        nam_hoc: semesterInfo.year || '',
        key: semesterInfo.value || ''
      };

      return next();
    } catch (error) {
      const err = error as Error;
      logError('Semester validation middleware error', err, {
        path: req.path,
        method: req.method,
        query: req.query
      });

      return sendResponse(
        res,
        500,
        ApiResponse.error('Lỗi xác thực học kỳ', 500, { code: 'SEMESTER_VALIDATION_ERROR' })
      );
    }
  };
}
