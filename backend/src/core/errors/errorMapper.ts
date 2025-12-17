/**
 * Error Mapper
 * Maps various error types to standardized AppError instances
 */

import {
  AppError,
  BadRequestError,
  UnauthorizedError,
  NotFoundError,
  ConflictError,
  ValidationError,
  InternalServerError,
} from './AppError';

/**
 * Prisma Error interface
 */
interface PrismaError extends Error {
  code?: string;
  meta?: {
    target?: string | string[];
    modelName?: string;
    field_name?: string;
    column?: string;
  };
}

/**
 * JWT Error interface
 */
interface JwtError extends Error {
  name: 'TokenExpiredError' | 'JsonWebTokenError' | 'NotBeforeError' | string;
}

/**
 * Joi/Zod Validation Error interface
 */
interface JoiValidationError extends Error {
  isJoi?: boolean;
  details?: Array<{
    path: (string | number)[];
    message: string;
  }>;
}

interface ZodValidationError extends Error {
  name: 'ZodError';
  errors?: Array<{
    path: (string | number)[];
    message: string;
  }>;
}

type ValidationErrorType = JoiValidationError | ZodValidationError;

/**
 * Map Prisma errors to AppError
 */
export function mapPrismaError(error: PrismaError): AppError {
  // Prisma error codes: https://www.prisma.io/docs/reference/api-reference/error-reference
  switch (error.code) {
    case 'P2002': // Unique constraint violation
      return new ConflictError(
        'Dữ liệu đã tồn tại',
        { field: error.meta?.target }
      );

    case 'P2025': // Record not found
      return new NotFoundError(
        'Không tìm thấy dữ liệu',
        { model: error.meta?.modelName }
      );

    case 'P2003': // Foreign key constraint violation
      return new BadRequestError(
        'Dữ liệu liên kết không hợp lệ',
        { field: error.meta?.field_name }
      );

    case 'P2011': // Null constraint violation
    case 'P2012': // Missing required value
      return new BadRequestError(
        'Thiếu thông tin bắt buộc',
        { field: error.meta?.column }
      );

    default:
      return new InternalServerError(
        'Lỗi cơ sở dữ liệu',
        { code: error.code, message: error.message }
      );
  }
}

/**
 * Map JWT errors to AppError
 */
export function mapJwtError(error: JwtError): AppError {
  switch (error.name) {
    case 'TokenExpiredError':
      return new UnauthorizedError('Token đã hết hạn');

    case 'JsonWebTokenError':
      return new UnauthorizedError('Token không hợp lệ');

    case 'NotBeforeError':
      return new UnauthorizedError('Token chưa có hiệu lực');

    default:
      return new UnauthorizedError('Lỗi xác thực token');
  }
}

/**
 * Map validation errors (from joi/zod) to AppError
 */
export function mapValidationError(error: ValidationErrorType): AppError {
  // Joi validation error
  if ((error as JoiValidationError).isJoi || error.name === 'ValidationError') {
    const joiError = error as JoiValidationError;
    const details = joiError.details?.map(d => ({
      field: d.path.join('.'),
      message: d.message,
    }));
    return new ValidationError('Dữ liệu không hợp lệ', details);
  }

  // Zod validation error
  if (error.name === 'ZodError') {
    const zodError = error as ZodValidationError;
    const details = zodError.errors?.map(e => ({
      field: e.path.join('.'),
      message: e.message,
    }));
    return new ValidationError('Dữ liệu không hợp lệ', details);
  }

  return new BadRequestError(error.message);
}

/**
 * Map any error to AppError
 */
export function mapError(error: Error | PrismaError | JwtError | ValidationErrorType): AppError {
  // Already an AppError
  if (error instanceof AppError) {
    return error;
  }

  // Prisma errors
  const prismaError = error as PrismaError;
  if (prismaError.code && prismaError.code.startsWith('P')) {
    return mapPrismaError(prismaError);
  }

  // JWT errors
  if (error.name && ['TokenExpiredError', 'JsonWebTokenError', 'NotBeforeError'].includes(error.name)) {
    return mapJwtError(error as JwtError);
  }

  // Validation errors
  const validationError = error as JoiValidationError;
  if (validationError.isJoi || error.name === 'ValidationError' || error.name === 'ZodError') {
    return mapValidationError(error as ValidationErrorType);
  }

  // Generic errors
  return new InternalServerError(
    error.message || 'Đã xảy ra lỗi',
    { originalError: error.name }
  );
}

// CommonJS compatibility
module.exports = {
  mapPrismaError,
  mapJwtError,
  mapValidationError,
  mapError,
};
