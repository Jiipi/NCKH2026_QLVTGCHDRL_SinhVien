/**
 * Application Entry Point
 * TypeScript version - Uses new modular architecture with app/server
 */

import { createServer } from './app/server';
import { connectDB, disconnectDB } from './data/infrastructure/prisma/client';
import { logInfo, logError } from './core/logger';
import config from './core/config';

// Create Express app
const app = createServer();

// Graceful shutdown handlers
process.on('SIGTERM', async () => {
  logInfo('SIGTERM received, shutting down gracefully');
  await disconnectDB();
  process.exit(0);
});

process.on('SIGINT', async () => {
  logInfo('SIGINT received, shutting down gracefully');
  await disconnectDB();
  process.exit(0);
});

/**
 * Start server
 */
const startServer = async (): Promise<void> => {
  try {
    // Connect to database
    await connectDB();

    // Initialize auto point calculation scheduler if available
    try {
      const autoPointCalculationService = require('./business/services/auto-point-calculation.service');
      if (autoPointCalculationService && typeof autoPointCalculationService.init === 'function') {
        autoPointCalculationService.init();
      } else {
        logInfo('Auto point calculation service disabled (no-op)');
      }
    } catch (e) {
      logError('Auto point calculation init failed (continuing without it)', e);
    }

    // Start listening
    const port = config.server.port;
    const host = config.server.host;
    
    app.listen(port, host, () => {
      logInfo(`🚀 Server started successfully`, {
        port,
        host,
        environment: config.server.nodeEnv,
        timestamp: new Date().toISOString(),
      });
    });
  } catch (error) {
    logError('Failed to start server', error);
    process.exit(1);
  }
};

startServer();
