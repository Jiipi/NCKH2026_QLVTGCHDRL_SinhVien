/**
 * Core Logger Module
 * Centralized logging using Winston
 */

import winston from 'winston';
import config from '../config';

/**
 * Logger meta type
 */
export type LogMeta = Record<string, unknown>;

/**
 * Create Winston logger instance
 */
const logger = winston.createLogger({
  level: config.logging.level || 'info',
  format: winston.format.combine(
    winston.format.timestamp({
      format: 'YYYY-MM-DD HH:mm:ss'
    }),
    winston.format.errors({ stack: true }),
    winston.format.splat(),
    winston.format.json()
  ),
  defaultMeta: { 
    service: 'dacn-api',
    environment: config.server.nodeEnv,
  },
  transports: [
    // Error logs
    new winston.transports.File({ 
      filename: 'logs/error.log', 
      level: 'error',
      maxsize: 5242880, // 5MB
      maxFiles: 5,
    }),
    // Combined logs
    new winston.transports.File({ 
      filename: 'logs/combined.log',
      maxsize: 5242880, // 5MB
      maxFiles: 5,
    }),
  ],
});

// Console logging for non-production environments
if (!config.server.isProduction) {
  logger.add(new winston.transports.Console({
    format: winston.format.combine(
      winston.format.colorize(),
      winston.format.printf(({ level, message, timestamp, ...meta }) => {
        const metaStr = Object.keys(meta).length ? `\n${JSON.stringify(meta, null, 2)}` : '';
        return `${timestamp} [${level}]: ${message}${metaStr}`;
      })
    ),
  }));
}

/**
 * Log info message
 */
export const logInfo = (message: string, meta: LogMeta = {}): void => {
  logger.info(message, meta);
};

/**
 * Log error message
 */
export const logError = (message: string, error: Error | unknown = null, meta: LogMeta = {}): void => {
  const errorMeta = error ? {
    error: {
      message: (error as Error).message,
      stack: (error as Error).stack,
      ...(error as object),
    }
  } : {};
  
  logger.error(message, { ...errorMeta, ...meta });
};

/**
 * Log warning message
 */
export const logWarn = (message: string, meta: LogMeta = {}): void => {
  logger.warn(message, meta);
};

/**
 * Log debug message
 */
export const logDebug = (message: string, meta: LogMeta = {}): void => {
  logger.debug(message, meta);
};

/**
 * Create a child logger with additional default metadata
 */
export const createChildLogger = (defaultMeta: LogMeta): winston.Logger => {
  return logger.child(defaultMeta);
};

export { logger };

// CommonJS compatibility
module.exports = {
  logger,
  logInfo,
  logError,
  logWarn,
  logDebug,
  createChildLogger,
};
