/**
 * Semester Lock Middleware
 * Enforces semester closure for write operations
 * @module core/http/middleware/semesterLock
 */

import { Request, Response, NextFunction, RequestHandler } from 'express';
import SemesterClosure from '../../../business/services/semesterClosure.service';

// Extend Request type
interface AuthRequest extends Request {
  user?: {
    sub?: string;
    id?: string;
    role?: string;
  };
}

interface SemesterParams {
  hoc_ky?: string;
  nam_hoc?: string;
  semester?: string;
  semester_code?: string;
  school_year?: string;
}

interface SemesterLockError extends Error {
  status?: number;
  details?: unknown;
}

/**
 * Extract hoc_ky/nam_hoc from request (supports both body and query)
 */
function extractSemester(req: Request): { hoc_ky: string | null; nam_hoc: string | null } {
  const src: SemesterParams = Object.assign({}, req.body || {}, req.query || {});
  const hoc_ky = src.hoc_ky || src.semester || src.semester_code || null;
  const nam_hoc = src.nam_hoc || src.school_year || null;
  return { hoc_ky, nam_hoc };
}

/**
 * For routes where admin passes classId explicitly (e.g., create activity for class)
 */
export const enforceAdminWritable: RequestHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void | Response> => {
  try {
    const authReq = req as AuthRequest;
    const { hoc_ky, nam_hoc } = extractSemester(req);
    const classId = req.body?.lop_id || req.body?.classId || (req.query?.classId as string) || null;
    const userRole = authReq.user?.role || null;
    await SemesterClosure.checkWritableForClassSemesterOrThrow({ classId, hoc_ky, nam_hoc, userRole });
    return next();
  } catch (err) {
    const error = err as SemesterLockError;
    const code = error.status || 423;
    return res.status(code).json({ 
      success: false, 
      message: error.message || 'SEMESTER_LOCKED', 
      details: error.details || null 
    });
  }
};

/**
 * For student/teacher/monitor actions: resolve class from userId internally
 */
export const enforceUserWritable: RequestHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void | Response> => {
  try {
    const authReq = req as AuthRequest;
    const { hoc_ky, nam_hoc } = extractSemester(req);
    const userId = authReq.user?.sub || authReq.user?.id;
    const userRole = authReq.user?.role || null;
    await SemesterClosure.enforceWritableForUserSemesterOrThrow({ userId, hoc_ky, nam_hoc, userRole });
    return next();
  } catch (err) {
    const error = err as SemesterLockError;
    const code = error.status || 423;
    return res.status(code).json({ 
      success: false, 
      message: error.message || 'SEMESTER_LOCKED', 
      details: error.details || null 
    });
  }
};
