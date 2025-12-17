/**
 * Not Found Middleware
 * Returns 404 for unmatched routes
 * @module core/http/middleware/notFound
 */

import { Request, Response, NextFunction } from 'express';

const notFoundMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  res.status(404).json({ error: 'Not Found' });
};

export default notFoundMiddleware;
