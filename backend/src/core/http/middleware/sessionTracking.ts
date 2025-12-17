/**
 * Session Tracking Middleware
 * Tracks user sessions and updates activity timestamps
 * @module core/http/middleware/sessionTracking
 */

import { Request, Response, NextFunction } from 'express';
import { logError } from '../../logger';
import { AuthenticatedRequest } from './authJwt';

// Dynamic import for service to avoid circular dependency
let SessionTrackingService: {
  trackSession: (userId: string, tabId: string, role: string | null) => Promise<void>;
  updateSessionActivity: (tabId: string) => Promise<void>;
} | null = null;

async function getSessionService() {
  if (!SessionTrackingService) {
    try {
      SessionTrackingService = require('../../../business/services/session-tracking.service');
    } catch (e) {
      logError('Failed to load SessionTrackingService', e as Error);
    }
  }
  return SessionTrackingService;
}

/**
 * Middleware to track user session activity
 * Should be placed after authJwt middleware
 */
export async function trackSession(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    // Skip if no authenticated user
    if (!req.user || !req.user.sub) {
      return next();
    }

    const userId = req.user.sub;
    const tabId = (req.headers['x-tab-id'] as string) || req.user.tabId || null;
    const role = req.user.role || null;

    // Track session asynchronously (don't block request)
    if (tabId) {
      const service = await getSessionService();
      if (service) {
        service.trackSession(userId, tabId, role)
          .catch((error: Error) => {
            logError('Session tracking failed in middleware', error);
          });
      }
    }

    next();
  } catch (error) {
    logError('Session tracking middleware error', error as Error);
    // Don't block request on tracking errors
    next();
  }
}

/**
 * Middleware to update session activity timestamp
 * Lightweight version that only updates timestamp
 */
export async function updateActivity(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const tabId = (req.headers['x-tab-id'] as string) || req.user?.tabId || null;

    if (tabId) {
      const service = await getSessionService();
      if (service) {
        // Update asynchronously
        service.updateSessionActivity(tabId)
          .catch((error: Error) => {
            logError('Activity update failed in middleware', error);
          });
      }
    }

    next();
  } catch (error) {
    logError('Activity update middleware error', error as Error);
    next();
  }
}
