/**
 * Rate Limiter Middleware
 * Protects against brute force and DoS attacks
 * @module core/http/middleware/rateLimiters
 */

import rateLimit from 'express-rate-limit';
import { Request } from 'express';

/**
 * Login request body interface
 */
interface LoginRequestBody {
  maso?: string;
  username?: string;
  email?: string;
}

/**
 * Login rate limiter
 * Limits login attempts per IP and username
 */
export const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: process.env.NODE_ENV === 'production' ? 1000 : 20,
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req: Request) => {
    const body = req.body as LoginRequestBody;
    const userKey = (body && (body.maso || body.username || body.email)) || 'anon';
    return `${req.ip}:${userKey}`;
  },
  message: {
    success: false,
    message: 'Thử đăng nhập quá nhiều lần, vui lòng thử lại sau ít phút'
  }
});

/**
 * General API rate limiter
 */
export const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: process.env.NODE_ENV === 'production' ? 1000 : 500,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Quá nhiều yêu cầu, vui lòng thử lại sau'
  }
});

/**
 * Strict rate limiter for sensitive operations
 */
export const strictLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: process.env.NODE_ENV === 'production' ? 100 : 50,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Quá nhiều yêu cầu cho thao tác này, vui lòng thử lại sau'
  }
});
