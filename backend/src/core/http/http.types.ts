/**
 * HTTP Middleware - Type Definitions
 * Express middleware types and interfaces
 */

import type { Request, Response, NextFunction } from 'express';
import type { NguoiDung, VaiTro, SinhVien } from '@prisma/client';

// ============== Request Extensions ==============

/**
 * Authenticated user payload from JWT
 */
export interface AuthPayload {
  sub: number;
  ten_dn: string;
  role: string;
  tabId?: string;
  iat?: number;
  exp?: number;
}

/**
 * Hydrated user object attached to request
 */
export interface RequestUser {
  id: number;
  ten_dn: string;
  ho_ten: string | null;
  email: string | null;
  role: string;
  vai_tro_id: number | null;
  tabId?: string;
  vai_tro?: VaiTro;
  sinh_vien?: SinhVien;
}

/**
 * Extended Express Request with authentication
 */
export interface AuthenticatedRequest extends Request {
  user?: RequestUser;
  token?: string;
  requestId?: string;
  startTime?: number;
}

/**
 * Request with class scope
 */
export interface ClassScopedRequest extends AuthenticatedRequest {
  classScope?: {
    classIds: number[];
    classNames: string[];
  };
}

/**
 * Request with semester context
 */
export interface SemesterScopedRequest extends AuthenticatedRequest {
  semester?: {
    hoc_ky: string;
    nam_hoc: string;
  };
}

// ============== Middleware Types ==============

/**
 * Express middleware function type
 */
export type MiddlewareFunction = (
  req: Request,
  res: Response,
  next: NextFunction
) => void | Promise<void>;

/**
 * Authenticated middleware function type
 */
export type AuthenticatedMiddleware = (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => void | Promise<void>;

/**
 * Error middleware function type
 */
export type ErrorMiddleware = (
  error: Error,
  req: Request,
  res: Response,
  next: NextFunction
) => void | Promise<void>;

/**
 * Async handler wrapper type
 */
export type AsyncHandler<T extends Request = Request> = (
  fn: (req: T, res: Response, next: NextFunction) => Promise<unknown>
) => (req: T, res: Response, next: NextFunction) => void;

// ============== Role & Permission Types ==============

/**
 * Valid role names
 */
export type RoleName = 'ADMIN' | 'GIANG_VIEN' | 'LOP_TRUONG' | 'SINH_VIEN';

/**
 * Role hierarchy levels
 */
export interface RoleHierarchy {
  ADMIN: number;
  GIANG_VIEN: number;
  LOP_TRUONG: number;
  SINH_VIEN: number;
}

/**
 * Permission check options
 */
export interface PermissionOptions {
  roles?: RoleName[];
  checkOwnership?: boolean;
  resourceType?: string;
}

// ============== Rate Limiter Types ==============

/**
 * Rate limiter options
 */
export interface RateLimiterOptions {
  windowMs: number;
  max: number;
  message?: string;
  skipSuccessfulRequests?: boolean;
  keyGenerator?: (req: Request) => string;
}

// ============== Upload Types ==============

/**
 * Upload file info
 */
export interface UploadedFile {
  fieldname: string;
  originalname: string;
  encoding: string;
  mimetype: string;
  destination: string;
  filename: string;
  path: string;
  size: number;
}

/**
 * Request with uploaded files
 * Note: Using 'any' for file types to avoid conflicts with multer's File type
 */
export interface UploadRequest extends AuthenticatedRequest {
  file?: Express.Multer.File;
  files?: Express.Multer.File[] | { [fieldname: string]: Express.Multer.File[] };
}

// ============== Sanitize Types ==============

/**
 * Sanitize options
 */
export interface SanitizeOptions {
  stripTags?: boolean;
  escapeHtml?: boolean;
  trimWhitespace?: boolean;
}

// ============== Session Types ==============

/**
 * Session tracking data
 */
export interface SessionData {
  userId: number;
  tabId?: string;
  ip: string;
  userAgent: string;
  loginTime: Date;
  lastActivity: Date;
}

// ============== Module Exports ==============
module.exports = {};
