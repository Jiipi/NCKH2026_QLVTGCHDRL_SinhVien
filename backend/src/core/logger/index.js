/**
 * Core Logger Module
 * Centralized logging using Winston
 */

const winston = require('winston');
const config = require('../config');

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
 * @param {string} message - Log message
 * @param {object} meta - Additional metadata
 */
const logInfo = (message, meta = {}) => {
  logger.info(message, meta);
};

/**
 * Log error message
 * @param {string} message - Log message
 * @param {Error} error - Error object
 * @param {object} meta - Additional metadata
 */
const logError = (message, error = null, meta = {}) => {
  const errorMeta = error ? {
    error: {
      message: error.message,
      stack: error.stack,
      ...error,
    }
  } : {};
  
  logger.error(message, { ...errorMeta, ...meta });
};

/**
 * Log warning message
 * @param {string} message - Log message
 * @param {object} meta - Additional metadata
 */
const logWarn = (message, meta = {}) => {
  logger.warn(message, meta);
};

/**
 * Log debug message
 * @param {string} message - Log message
 * @param {object} meta - Additional metadata
 */
const logDebug = (message, meta = {}) => {
  logger.debug(message, meta);
};

/**
 * Create a child logger with additional default metadata
 * @param {object} defaultMeta - Default metadata for child logger
 * @returns {winston.Logger}
 */
const createChildLogger = (defaultMeta) => {
  return logger.child(defaultMeta);
};

module.exports = {
  logger,
  logInfo,
  logError,
  logWarn,
  logDebug,
  createChildLogger,
};




