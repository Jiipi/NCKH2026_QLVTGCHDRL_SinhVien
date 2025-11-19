/**
 * Scheduled Session Cleanup Job
 * Run this periodically to clean up old sessions
 * Can be triggered by cron job or scheduler
 */

const SessionTrackingService = require('../services/session-tracking.service');
const { logInfo, logError } = require('../core/logger');

async function cleanupSessions() {
  try {
    logInfo('Starting session cleanup job...');
    
    // Cleanup sessions older than 24 hours
    const deletedCount = await SessionTrackingService.cleanupOldSessions(24);
    
    logInfo(`Session cleanup completed: Deleted ${deletedCount} old sessions`);
    
    return {
      success: true,
      deletedCount,
      timestamp: new Date()
    };
  } catch (error) {
    logError('Session cleanup job failed', error);
    return {
      success: false,
      error: error.message,
      timestamp: new Date()
    };
  }
}

// If running as standalone script
if (require.main === module) {
  cleanupSessions()
    .then(result => {
      console.log('Cleanup result:', result);
      process.exit(result.success ? 0 : 1);
    })
    .catch(error => {
      console.error('Cleanup failed:', error);
      process.exit(1);
    });
}

module.exports = cleanupSessions;
