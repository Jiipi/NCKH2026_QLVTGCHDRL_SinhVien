/**
 * Express Server Setup
 * Initializes Express app with all middleware and routes
 */

import express, { Express, Request, Response, NextFunction } from 'express';
import path from 'path';
import fs from 'fs';
import rateLimit from 'express-rate-limit';
import helmet from 'helmet';
import compression from 'compression';

import config from '../core/config';
import { logInfo } from '../core/logger';
import routes from './routes';

// Use require for JS modules that don't have TS definitions yet
const middleware = require('../core/http/middleware');

/**
 * Extended Request type with user property
 */
interface AuthenticatedRequest extends Request {
  user?: {
    sub?: string;
    [key: string]: unknown;
  };
}

/**
 * Create and configure Express application
 */
export function createServer(): Express {
  const app = express();

  // ===================== SECURITY & PERFORMANCE =====================

  // CORS middleware - MUST be first
  app.use(middleware.cors);

  // Security headers with Helmet
  app.use(
    helmet({
      // Relax CORP so /uploads resources can be used cross-origin
      crossOriginResourcePolicy: { policy: 'cross-origin' },
      crossOriginEmbedderPolicy: false,
      contentSecurityPolicy: {
        useDefaults: true,
        directives: {
          'default-src': ["'self'"],
          'img-src': ["'self'", 'data:', 'blob:'],
          'style-src': ["'self'", "'unsafe-inline'", 'https://fonts.googleapis.com'],
          'font-src': ["'self'", 'https://fonts.gstatic.com', 'data:'],
          'script-src': ["'self'"],
          'connect-src': ["'self'"],
        },
      },
    })
  );

  // Compression middleware
  app.use(compression());

  // Rate limiting
  const limiter = rateLimit({
    windowMs: config.rateLimit.windowMs,
    max: config.rateLimit.max,
    message: config.rateLimit.message,
    standardHeaders: true,
    legacyHeaders: false,
    keyGenerator: (req: AuthenticatedRequest) => `${req.ip}:${req.user?.sub || 'anon'}`,
    skip: (req: Request) => {
      // Skip rate limiting for demo accounts endpoint
      return req.path === '/api/auth/demo-accounts';
    },
  });
  
  // Stricter rate limit for password reset (3 attempts per 15 minutes per IP)
  const passwordResetLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 3, // 3 requests per window
    message: 'Too many password reset attempts. Please try again later.',
    standardHeaders: true,
    keyGenerator: (req: Request) => req.ip || 'unknown',
  });
  
  // Apply password reset rate limiter
  app.use('/api/auth/forgot-password', passwordResetLimiter);
  app.use('/api/auth/reset-password', passwordResetLimiter);
  
  app.use('/api/', limiter);

  // ===================== BODY PARSING =====================

  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true, limit: '10mb' }));

  // ===================== INPUT SANITIZATION =====================

  app.use(middleware.sanitize);

  // ===================== REQUEST LOGGING =====================

  app.use((req: Request, _res: Response, next: NextFunction) => {
    logInfo(`${req.method} ${req.path}`, {
      ip: req.ip,
      userAgent: req.get('User-Agent'),
      timestamp: new Date().toISOString(),
    });
    next();
  });

  // ===================== STATIC FILES =====================

  // Serve uploaded files with CORS
  const uploadsPath = path.resolve(__dirname, '../../uploads');
  app.use(
    '/uploads',
    middleware.cors,
    express.static(uploadsPath, {
      setHeaders: (res) => {
        res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');
        res.setHeader('Cache-Control', 'public, max-age=31536000');
      },
    })
  );

  // ===================== API ROUTES =====================

  app.use('/api', routes);

  // ===================== HEALTH CHECK =====================

  app.get('/health', (_req: Request, res: Response) => {
    res.json({
      status: 'OK',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: config.server.nodeEnv,
    });
  });

  // ===================== FRONTEND SERVING (SPA) =====================

  // Serve frontend build for single-process deployment
  try {
    const frontendBuildPath = path.resolve(__dirname, '../../../frontend/build');
    if (fs.existsSync(frontendBuildPath)) {
      app.use(express.static(frontendBuildPath));
      app.get('*', (req: Request, res: Response, next: NextFunction) => {
        // Don't serve index.html for API routes
        if (req.path.startsWith('/api') || req.path.startsWith('/health')) {
          return next();
        }
        res.sendFile(path.join(frontendBuildPath, 'index.html'));
      });
    }
  } catch (e) {
    // Ignore if build not present (development)
  }

  // ===================== ERROR HANDLING =====================

  // 404 Not Found handler
  app.use(middleware.notFoundHandler);

  // Global error handler (must be last)
  app.use(middleware.errorHandler);

  return app;
}

// CommonJS compatibility
module.exports = { createServer };
