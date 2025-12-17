/**
 * Prisma Client Singleton
 * Centralized Prisma client instance management
 */

import { PrismaClient } from '@prisma/client';
import { logInfo, logError } from '../../../core/logger';
import config from '../../../core/config';

/**
 * Prisma client instance with logging configuration
 */
export const prisma = new PrismaClient({
  log: config.database.logQueries
    ? ['query', 'info', 'warn', 'error']
    : ['warn', 'error'],
  errorFormat: 'pretty',
});

/**
 * Connect to database
 */
export async function connectDB(): Promise<void> {
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
 */
export async function disconnectDB(): Promise<void> {
  try {
    await prisma.$disconnect();
    logInfo('✅ Database disconnected successfully');
  } catch (error) {
    logError('❌ Database disconnection failed', error);
  }
}

/**
 * Health check for database connection
 */
export async function healthCheck(): Promise<boolean> {
  try {
    await prisma.$queryRaw`SELECT 1`;
    return true;
  } catch (error) {
    logError('Database health check failed', error);
    return false;
  }
}

// Note: Lifecycle and signal handling is centralized in src/index.ts.
// We intentionally avoid attaching process-level handlers here to prevent
// duplicate disconnects or conflicting exits.

// CommonJS compatibility
module.exports = {
  prisma,
  connectDB,
  disconnectDB,
  healthCheck,
};
