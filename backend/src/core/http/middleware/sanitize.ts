/**
 * Sanitize Middleware
 * Sanitizes request body, query, and params to prevent XSS
 * @module core/http/middleware/sanitize
 */

import { Request, Response, NextFunction } from 'express';
import { sanitizeInput } from '../../utils/validation';

/**
 * Sanitize middleware
 * Recursively sanitizes body, query, and params
 */
export function sanitizeMiddleware(req: Request, res: Response, next: NextFunction): void {
  try {
    if (req.body) req.body = sanitizeInput(req.body);
    if (req.query) req.query = sanitizeInput(req.query) as typeof req.query;
    if (req.params) req.params = sanitizeInput(req.params);
  } catch (_) {
    // Ignore errors during sanitization
  }
  next();
}

export default sanitizeMiddleware;
