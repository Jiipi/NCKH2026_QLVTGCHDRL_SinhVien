/**
 * JWT Authentication Middleware
 * Verifies JWT token and attaches user to request
 * @module core/http/middleware/authJwt
 */

import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import config from '../../config';
import { ApiResponse, sendResponse } from '../response/apiResponse';
import { logError } from '../../logger';
import { prisma } from '../../../data/infrastructure/prisma/client';

/**
 * User JWT payload interface
 */
export interface JwtPayload {
  sub: string;
  role?: string;
  tabId?: string;
  iat?: number;
  exp?: number;
}

/**
 * Extended Request with user
 */
export interface AuthenticatedRequest extends Request {
  user?: JwtPayload;
}

/**
 * Normalize role name to uppercase standard
 * Returns empty string for unknown roles (will be rejected by middleware)
 */
export function normalizeRole(role: string | undefined | null): string {
  if (!role) return '';
  const normalized = String(role).toUpperCase().trim();
  const validRoles = ['ADMIN', 'GIANG_VIEN', 'LOP_TRUONG', 'SINH_VIEN'];
  if (!validRoles.includes(normalized)) {
    logError('Unknown role detected, rejecting', new Error(`Invalid role: ${role}`));
    return '';
  }
  return normalized;
}

/**
 * Main authentication middleware
 * Verifies JWT token and hydrates user object
 */
export async function authJwt(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void | Response> {
  try {
    const header = req.headers.authorization || '';
    const token = header.startsWith('Bearer ') ? header.slice(7) : null;

    if (!token) {
      return sendResponse(res, 401, ApiResponse.unauthorized('Token không được cung cấp'));
    }

    // Verify token
    const decoded = jwt.verify(token, config.jwt.secret) as JwtPayload;

    // Extract tabId from header (optional - for multi-tab management)
    const tabId = req.headers['x-tab-id'] as string || decoded.tabId || undefined;
    if (tabId) {
      decoded.tabId = tabId;
    }

    // Hydrate role from database if missing or invalid
    let role = decoded.role;
    if (!role) {
      try {
        const dbUser = await prisma.nguoiDung.findUnique({
          where: { id: decoded.sub },
          include: { vai_tro: true }
        });
        if (dbUser) {
          role = dbUser.vai_tro?.ten_vt || 'SINH_VIEN';
        }
      } catch (e) {
        logError('Failed to hydrate user role', e as Error);
        // Use existing role or default
      }
    }

    // Normalize and validate role
    decoded.role = normalizeRole(role);
    if (!decoded.role) {
      return sendResponse(res, 403, ApiResponse.forbidden('Vai trò không hợp lệ'));
    }
    req.user = decoded;

    return next();
  } catch (error) {
    const err = error as Error & { name: string };
    logError('Auth middleware error', err, {
      ip: req.ip,
      userAgent: req.get('User-Agent'),
    });

    if (err.name === 'TokenExpiredError') {
      return sendResponse(res, 401, ApiResponse.unauthorized('Token đã hết hạn'));
    }
    if (err.name === 'JsonWebTokenError') {
      return sendResponse(res, 401, ApiResponse.unauthorized('Token không hợp lệ'));
    }
    return sendResponse(res, 401, ApiResponse.unauthorized('Token không hợp lệ hoặc đã hết hạn'));
  }
}

/**
 * Alias for backward compatibility
 */
export const auth = authJwt;

/**
 * Authorize specific roles
 */
export function authorizeRoles(...roles: string[]) {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction): void | Response => {
    const userRole = String(req.user?.role || '').toUpperCase();
    const allowed = roles.map(r => String(r).toUpperCase());

    if (!userRole || !allowed.includes(userRole)) {
      return sendResponse(
        res,
        403,
        ApiResponse.forbidden('Bạn không có quyền truy cập tài nguyên này')
      );
    }

    next();
  };
}

/**
 * Require admin role
 */
export function requireAdmin(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): void | Response {
  const role = String(req.user?.role || '').toUpperCase();
  if (role !== 'ADMIN') {
    return sendResponse(res, 403, ApiResponse.forbidden('Chỉ admin mới có quyền truy cập'));
  }
  next();
}

/**
 * Require teacher or above (Teacher, Admin)
 */
export function requireTeacher(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): void | Response {
  const role = String(req.user?.role || '').toUpperCase();
  const allowedRoles = ['GIANG_VIEN', 'ADMIN'];

  if (!allowedRoles.includes(role)) {
    return sendResponse(
      res,
      403,
      ApiResponse.forbidden('Chỉ giảng viên trở lên mới có quyền truy cập')
    );
  }
  next();
}

/**
 * Require monitor or above (Monitor, Teacher, Admin)
 */
export function requireMonitor(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): void | Response {
  const role = String(req.user?.role || '').toUpperCase();
  const allowedRoles = ['LOP_TRUONG', 'GIANG_VIEN', 'ADMIN'];

  if (!allowedRoles.includes(role)) {
    return sendResponse(
      res,
      403,
      ApiResponse.forbidden('Chỉ lớp trưởng trở lên mới có quyền truy cập')
    );
  }
  next();
}

/**
 * Alias for isClassMonitor - backward compatibility
 */
export const isClassMonitor = requireMonitor;
