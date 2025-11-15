/**
 * Prisma Client Singleton
 * Centralized Prisma client instance management
 */

const { PrismaClient } = require('@prisma/client');
const { logInfo, logError } = require('../../core/logger');
const config = require('../../core/config');

/**
 * Prisma client instance with logging configuration
 */
const prisma = new PrismaClient({
  log: config.database.logQueries
    ? ['query', 'info', 'warn', 'error']
    : ['warn', 'error'],
  errorFormat: 'pretty',
});

/**
 * Connect to database
 * @returns {Promise<void>}
 */
async function connectDB() {
  try {
    await prisma.$connect();
    logInfo('✅ Database connected successfully', {
      environment: config.server.nodeEnv,
    });
  } catch (error) {
    logError('❌ Database connection failed', error);
    process.exit(1);
  }
}

/**
 * Disconnect from database
 * @returns {Promise<void>}
 */
async function disconnectDB() {
  try {
    await prisma.$disconnect();
    logInfo('✅ Database disconnected successfully');
  } catch (error) {
    logError('❌ Database disconnection failed', error);
  }
}

/**
 * Health check for database connection
 * @returns {Promise<boolean>}
 */
async function healthCheck() {
  try {
    await prisma.$queryRaw`SELECT 1`;
    return true;
  } catch (error) {
    logError('Database health check failed', error);
    return false;
  }
}

// Note: Lifecycle and signal handling is centralized in src/index.js.
// We intentionally avoid attaching process-level handlers here to prevent
// duplicate disconnects or conflicting exits.

module.exports = {
  prisma,
  connectDB,
  disconnectDB,
  healthCheck,
};




