/**
 * Session Tracking Middleware
 * Tracks user sessions and updates activity timestamps
 */

const SessionTrackingService = require('../../../business/services/session-tracking.service');
const { logError } = require('../../logger');

/**
 * Middleware to track user session activity
 * Should be placed after authJwt middleware
 */
const trackSession = async (req, res, next) => {
  try {
    // Skip if no authenticated user
    if (!req.user || !req.user.sub) {
      return next();
    }

    const userId = req.user.sub;
    const tabId = req.headers['x-tab-id'] || req.user.tabId || null;
    const role = req.user.role || null;

    // Track session asynchronously (don't block request)
    if (tabId) {
      SessionTrackingService.trackSession(userId, tabId, role)
        .catch(error => {
          logError('Session tracking failed in middleware', error);
        });
    }

    next();
  } catch (error) {
    logError('Session tracking middleware error', error);
    // Don't block request on tracking errors
    next();
  }
};

/**
 * Middleware to update session activity timestamp
 * Lightweight version that only updates timestamp
 */
const updateActivity = async (req, res, next) => {
  try {
    const tabId = req.headers['x-tab-id'] || req.user?.tabId || null;

    if (tabId) {
      // Update asynchronously
      SessionTrackingService.updateSessionActivity(tabId)
        .catch(error => {
          logError('Activity update failed in middleware', error);
        });
    }

    next();
  } catch (error) {
    logError('Activity update middleware error', error);
    next();
  }
};

module.exports = {
  trackSession,
  updateActivity
};
