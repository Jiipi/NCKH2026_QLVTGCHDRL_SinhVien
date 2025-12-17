/**
 * CORS Middleware Configuration
 * Cross-Origin Resource Sharing setup
 * @module core/http/middleware/cors
 */

import cors, { CorsOptions, CorsOptionsDelegate } from 'cors';

/**
 * Allowed origins type
 */
type AllowedOrigins = boolean | string | string[];

/**
 * Parse CORS_ORIGIN environment variable
 * Supports: single origin, comma-separated list, or wildcard
 */
function getAllowedOrigins(): AllowedOrigins {
  const envOrigin = process.env.CORS_ORIGIN || 'http://localhost:3000';

  // Wildcard: allow all origins (use carefully!)
  if (envOrigin === '*' || envOrigin === 'true') {
    return true;
  }

  // Comma-separated list: "http://localhost:3000,http://192.168.1.100:3000"
  if (envOrigin.includes(',')) {
    return envOrigin.split(',').map(o => o.trim()).filter(Boolean);
  }

  // Single origin
  return envOrigin;
}

/**
 * CORS options with flexible origin handling
 */
const corsOptions: CorsOptions = {
  origin: function (origin, callback) {
    const allowedOrigins = getAllowedOrigins();

    // Development: verify against configured origins for security
    if (process.env.NODE_ENV === 'development') {
      // Even in dev mode, validate against CORS_ORIGIN config
      if (!origin || allowedOrigins === true || 
          (Array.isArray(allowedOrigins) && allowedOrigins.includes(origin)) ||
          (typeof allowedOrigins === 'string' && allowedOrigins === origin)) {
        console.log(`[CORS] Dev mode - allowing origin: ${origin || '(no origin)'}`);
        return callback(null, true);
      } else {
        const allowedList = Array.isArray(allowedOrigins) ? allowedOrigins.join(', ') : allowedOrigins;
        console.warn(`[CORS] Dev mode - rejected origin: ${origin}. Allowed: ${allowedList}`);
        return callback(new Error('Not allowed by CORS'));
      }
    }

    // Production: check against whitelist
    if (allowedOrigins === true) {
      return callback(null, true);
    }

    // No origin (same-origin request or server-to-server)
    if (!origin) {
      return callback(null, true);
    }

    // Array of allowed origins
    if (Array.isArray(allowedOrigins)) {
      if (allowedOrigins.indexOf(origin) !== -1) {
        return callback(null, true);
      }
      console.warn(`[CORS] Rejected origin: ${origin}. Allowed: ${allowedOrigins.join(', ')}`);
      return callback(new Error('Not allowed by CORS'));
    }

    // Single allowed origin
    if (origin === allowedOrigins) {
      return callback(null, true);
    }

    console.warn(`[CORS] Rejected origin: ${origin}. Expected: ${allowedOrigins}`);
    callback(new Error('Not allowed by CORS'));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Cache-Control', 'Pragma', 'X-Tab-Id', 'X-Dev-Otp-Code'],
  exposedHeaders: ['X-Tab-Id', 'X-Dev-Otp-Code'],
  optionsSuccessStatus: 204
};

/**
 * Configured CORS middleware
 */
export const corsMiddleware = cors(corsOptions);

/**
 * Export CORS options for custom configuration
 */
export { corsOptions, getAllowedOrigins };

export default corsMiddleware;
