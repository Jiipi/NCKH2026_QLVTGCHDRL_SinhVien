/**
 * Scheduled Session Cleanup Job
 * Run this periodically to clean up old sessions
 * Can be triggered by cron job or scheduler
 */

import SessionTrackingService from '../services/session-tracking.service';
import { logInfo, logError } from '../../core/logger';

interface CleanupResult {
  success: boolean;
  deletedCount?: number;
  error?: string;
  timestamp: Date;
}

async function cleanupSessions(): Promise<CleanupResult> {
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
  } catch (error: unknown) {
    logError('Session cleanup job failed', error);
    return {
      success: false,
      error: (error as Error).message,
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

export default cleanupSessions;
