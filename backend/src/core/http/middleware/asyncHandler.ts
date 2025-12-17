/**
 * AsyncHandler Middleware
 * Wraps async route handlers to automatically catch errors
 * Prevents unhandled promise rejections in Express routes
 * @module core/http/middleware/asyncHandler
 */

import { Request, Response, NextFunction, RequestHandler } from 'express';

/**
 * Async request handler type
 */
type AsyncRequestHandler = (
  req: Request,
  res: Response,
  next: NextFunction
) => Promise<unknown>;

/**
 * Wrap async route handlers to catch errors automatically
 * @param fn - Async route handler function
 * @returns Express middleware function
 */
export function asyncHandler(fn: AsyncRequestHandler): RequestHandler {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}
