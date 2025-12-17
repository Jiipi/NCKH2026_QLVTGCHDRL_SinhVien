/**
 * Type declarations for existing JavaScript modules
 * This allows TypeScript to work with existing JS code
 */

// API Response Types
declare module '../http/response/apiResponse' {
  export interface ApiResponseData<T = unknown> {
    success: boolean;
    message: string;
    data?: T;
    statusCode: number;
    timestamp: string;
    errors?: unknown;
  }

  export class ApiResponse {
    static success<T>(data: T, message?: string, statusCode?: number): ApiResponseData<T>;
    static error(message?: string, statusCode?: number, errors?: unknown): ApiResponseData<never>;
    static validationError(errors: unknown, message?: string): ApiResponseData<never>;
    static notFound(message?: string): ApiResponseData<never>;
    static unauthorized(message?: string): ApiResponseData<never>;
    static forbidden(message?: string): ApiResponseData<never>;
    static paginated<T>(data: T[], total: number, page: number, limit: number, message?: string): ApiResponseData<{
      items: T[];
      pagination: {
        total: number;
        page: number;
        limit: number;
        totalPages: number;
        hasNext: boolean;
        hasPrev: boolean;
      };
    }>;
  }

  export function sendResponse<T>(
    res: import('express').Response,
    statusCode: number,
    data: ApiResponseData<T>
  ): import('express').Response;
}

// AppError Types
declare module '../errors/AppError' {
  export class AppError extends Error {
    statusCode: number;
    isOperational: boolean;
    details: unknown;
    timestamp: string;
    
    constructor(message: string, statusCode?: number, isOperational?: boolean, details?: unknown);
    toJSON(): object;
  }

  export class BadRequestError extends AppError {
    constructor(message?: string, details?: unknown);
  }

  export class UnauthorizedError extends AppError {
    constructor(message?: string, details?: unknown);
  }

  export class ForbiddenError extends AppError {
    constructor(message?: string, details?: unknown);
  }

  export class NotFoundError extends AppError {
    constructor(message?: string, details?: unknown);
  }

  export class ConflictError extends AppError {
    constructor(message?: string, details?: unknown);
  }

  export class ValidationError extends AppError {
    constructor(message?: string, details?: unknown);
  }

  export class InternalServerError extends AppError {
    constructor(message?: string, details?: unknown);
  }
}

// Logger Types
declare module '../logger' {
  export function logError(message: string, error?: unknown): void;
  export function logInfo(message: string, meta?: object): void;
  export function logWarn(message: string, meta?: object): void;
  export function logDebug(message: string, meta?: object): void;
  export const logger: {
    error: (message: string, meta?: object) => void;
    info: (message: string, meta?: object) => void;
    warn: (message: string, meta?: object) => void;
    debug: (message: string, meta?: object) => void;
  };
}
