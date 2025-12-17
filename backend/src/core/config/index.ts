/**
 * Core Configuration Module
 * Centralized configuration management with environment variable loading
 * and validation
 */

import * as dotenv from 'dotenv';
import * as fs from 'fs';

dotenv.config();

// Optional: Load .env.local for local overrides
try {
  if (fs.existsSync('.env.local')) {
    dotenv.config({ path: '.env.local', override: true });
  }
} catch (_) {
  // .env.local không tồn tại - skip
}

/**
 * Configuration Types
 */
export interface ServerConfig {
  port: number;
  host: string;
  nodeEnv: string;
  isProduction: boolean;
  isDevelopment: boolean;
}

export interface JwtConfig {
  secret: string;
  expiresIn: string;
  refreshExpiresIn: string;
}

export interface DatabaseConfig {
  url: string | undefined;
  logQueries: boolean;
}

export interface CorsConfig {
  origin: string;
  credentials: boolean;
}

export interface RateLimitConfig {
  windowMs: number;
  max: number;
  message: string;
}

export interface UploadConfig {
  maxFileSize: number;
  allowedImageTypes: string[];
  allowedDocTypes: string[];
}

export interface LoggingConfig {
  level: string;
  format: string;
}

export interface SecurityConfig {
  bcryptRounds: number;
  sessionSecret: string;
}

export interface FeaturesConfig {
  autoPointCalculation: boolean;
  emailNotifications: boolean;
}

export interface AppConfig {
  server: ServerConfig;
  jwt: JwtConfig;
  database: DatabaseConfig;
  cors: CorsConfig;
  rateLimit: RateLimitConfig;
  upload: UploadConfig;
  logging: LoggingConfig;
  security: SecurityConfig;
  features: FeaturesConfig;
}

/**
 * Application Configuration Object
 * All configuration values should be accessed through this object
 */
const config: AppConfig = {
  // Server Configuration
  server: {
    port: parseInt(process.env.PORT || '5000', 10),
    host: process.env.HOST || '0.0.0.0',
    nodeEnv: process.env.NODE_ENV || 'development',
    isProduction: (process.env.NODE_ENV || 'development') === 'production',
    isDevelopment: (process.env.NODE_ENV || 'development') === 'development',
  },

  // JWT Configuration
  jwt: {
    secret: process.env.JWT_SECRET || 'your-secret-key-change-in-production',
    expiresIn: process.env.JWT_EXPIRES_IN || '1d',
    refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
  },

  // Database Configuration
  database: {
    url: process.env.DATABASE_URL,
    logQueries: process.env.DB_LOG_QUERIES === 'true',
  },

  // CORS Configuration
  cors: {
    origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
    credentials: true,
  },

  // Rate Limiting Configuration
  rateLimit: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: (process.env.NODE_ENV || 'development') === 'development' ? 10000 : 10000,
    message: 'Too many requests from this IP, please try again later',
  },

  // File Upload Configuration
  upload: {
    maxFileSize: parseInt(process.env.MAX_FILE_SIZE || '10485760', 10), // 10MB default
    allowedImageTypes: ['image/jpeg', 'image/png', 'image/webp'],
    allowedDocTypes: ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
  },

  // Logging Configuration
  logging: {
    level: process.env.LOG_LEVEL || 'info',
    format: process.env.LOG_FORMAT || 'json',
  },

  // Security Configuration
  security: {
    bcryptRounds: parseInt(process.env.BCRYPT_ROUNDS || '10', 10),
    sessionSecret: process.env.SESSION_SECRET || 'session-secret-change-in-production',
  },

  // Feature Flags
  features: {
    autoPointCalculation: process.env.FEATURE_AUTO_POINT_CALC === 'true',
    emailNotifications: process.env.FEATURE_EMAIL_NOTIFICATIONS === 'true',
  },
};

/**
 * Validate required configuration
 * Throws error if critical config is missing
 */
function validateConfig(): void {
  const required = [
    'DATABASE_URL',
    'JWT_SECRET',
  ];

  const missing = required.filter(key => !process.env[key]);

  if (missing.length > 0 && config.server.isProduction) {
    throw new Error(
      `Missing required environment variables: ${missing.join(', ')}\n` +
      'Please check your .env file or environment configuration.'
    );
  }

  if (missing.length > 0 && config.server.isDevelopment) {
    console.warn('⚠️  Warning: Missing environment variables:', missing.join(', '));
    console.warn('⚠️  Using default values for development');
  }
}

// Validate on module load
validateConfig();

export default config;

// CommonJS compatibility
module.exports = config;
module.exports.default = config;
