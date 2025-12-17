import winston from 'winston';

// Cấu hình logger
const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp({
      format: 'YYYY-MM-DD HH:mm:ss'
    }),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  defaultMeta: { service: 'dacn-api' },
  transports: [
    // Ghi log vào file
    new winston.transports.File({ 
      filename: 'logs/error.log', 
      level: 'error' 
    }),
    new winston.transports.File({ 
      filename: 'logs/combined.log' 
    }),
  ],
});

// Nếu không phải production thì log ra console
if (process.env.NODE_ENV !== 'production') {
  logger.add(new winston.transports.Console({
    format: winston.format.combine(
      winston.format.colorize(),
      winston.format.simple()
    )
  }));
}

// Helper functions
export const logInfo = (message: string, meta: Record<string, unknown> = {}): void => {
  logger.info(message, meta);
};

export const logError = (
  message: string, 
  error: Error | string | null = null, 
  meta: Record<string, unknown> = {}
): void => {
  const errorStack = error instanceof Error ? error.stack : error;
  logger.error(message, { error: errorStack, ...meta });
};

export const logWarn = (message: string, meta: Record<string, unknown> = {}): void => {
  logger.warn(message, meta);
};

export const logDebug = (message: string, meta: Record<string, unknown> = {}): void => {
  logger.debug(message, meta);
};

export { logger };

// CommonJS compatibility
module.exports = {
  logger,
  logInfo,
  logError,
  logWarn,
  logDebug
};
