/**
 * Application Entry Point
 * Uses new modular architecture with app/server.js
 */

const { createServer } = require('./app/server');
const { connectDB, disconnectDB } = require('./infrastructure/prisma/client');
const { logInfo, logError } = require('./core/logger');
const config = require('./core/config');

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
const startServer = async () => {
  try {
  // Connect to database
    await connectDB();

    // Initialize auto point calculation scheduler if available
    try {
      const autoPointCalculationService = require('./services/auto-point-calculation.service');
      if (autoPointCalculationService && typeof autoPointCalculationService.init === 'function') {
        autoPointCalculationService.init();
      } else {
        logInfo('Auto point calculation service disabled (no-op)');
      }
    } catch (e) {
      logError('Auto point calculation init failed (continuing without it)', e);
    }

    // Start listening
    app.listen(config.server.port, config.server.host, () => {
      logInfo(`🚀 Server started successfully`, {
        port: config.server.port,
        host: config.server.host,
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



