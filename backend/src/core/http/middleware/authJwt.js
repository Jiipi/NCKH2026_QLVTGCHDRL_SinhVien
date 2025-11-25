/**
 * JWT Authentication Middleware
 * Verifies JWT token and attaches user to request
 */

const jwt = require('jsonwebtoken');
const config = require('../../config');
const { ApiResponse, sendResponse } = require('../response/apiResponse');
const { logError } = require('../../logger');
const { prisma } = require('../../../data/infrastructure/prisma/client');
const { UnauthorizedError } = require('../../errors/AppError');

/**
 * Normalize role name to uppercase standard
 * @param {string} role - Role name
 * @returns {string} - Normalized role
 */
function normalizeRole(role) {
  if (!role) return 'SINH_VIEN';
  const normalized = String(role).toUpperCase().trim();
  const validRoles = ['ADMIN', 'GIANG_VIEN', 'LOP_TRUONG', 'SINH_VIEN'];
  return validRoles.includes(normalized) ? normalized : 'SINH_VIEN';
}

/**
 * Main authentication middleware
 * Verifies JWT token and hydrates user object
 */
const authJwt = async (req, res, next) => {
  try {
    const header = req.headers.authorization || '';
    const token = header.startsWith('Bearer ') ? header.slice(7) : null;

    if (!token) {
      return sendResponse(res, 401, ApiResponse.unauthorized('Token không được cung cấp'));
    }

    // Verify token
    const decoded = jwt.verify(token, config.jwt.secret);

    // Extract tabId from header (optional - for multi-tab management)
    const tabId = req.headers['x-tab-id'] || decoded.tabId || null;
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
        logError('Failed to hydrate user role', e);
        // Use existing role or default
      }
    }

    // Normalize and attach to request
    decoded.role = normalizeRole(role);
    req.user = decoded;

    return next();
  } catch (error) {
    logError('Auth middleware error', error, {
      ip: req.ip,
      userAgent: req.get('User-Agent'),
    });

    if (error.name === 'TokenExpiredError') {
      return sendResponse(res, 401, ApiResponse.unauthorized('Token đã hết hạn'));
    }
    if (error.name === 'JsonWebTokenError') {
      return sendResponse(res, 401, ApiResponse.unauthorized('Token không hợp lệ'));
    }
    return sendResponse(res, 401, ApiResponse.unauthorized('Token không hợp lệ hoặc đã hết hạn'));
  }
};

/**
 * Authorize specific roles
 * @param {...string} roles - Allowed roles
 * @returns {Function} - Middleware function
 */
const authorizeRoles = (...roles) => (req, res, next) => {
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

/**
 * Require admin role
 */
const requireAdmin = (req, res, next) => {
  const role = String(req.user?.role || '').toUpperCase();
  if (role !== 'ADMIN') {
    return sendResponse(res, 403, ApiResponse.forbidden('Chỉ admin mới có quyền truy cập'));
  }
  next();
};

/**
 * Require teacher or above (Teacher, Admin)
 */
const requireTeacher = (req, res, next) => {
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
};

/**
 * Require monitor or above (Monitor, Teacher, Admin)
 */
const requireMonitor = (req, res, next) => {
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
};

module.exports = {
  authJwt,
  auth: authJwt, // Alias for backward compatibility
  authorizeRoles,
  requireAdmin,
  requireTeacher,
  requireMonitor,
  normalizeRole,
};




