/**
 * Error Mapper
 * Maps various error types to standardized AppError instances
 */

const {
  AppError,
  BadRequestError,
  UnauthorizedError,
  ForbiddenError,
  NotFoundError,
  ValidationError,
  InternalServerError,
} = require('./AppError');

/**
 * Map Prisma errors to AppError
 * @param {Error} error - Prisma error
 * @returns {AppError}
 */
function mapPrismaError(error) {
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
 * @param {Error} error - JWT error
 * @returns {AppError}
 */
function mapJwtError(error) {
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
 * @param {Error} error - Validation error
 * @returns {AppError}
 */
function mapValidationError(error) {
  // Joi validation error
  if (error.isJoi || error.name === 'ValidationError') {
    const details = error.details?.map(d => ({
      field: d.path.join('.'),
      message: d.message,
    }));
    return new ValidationError('Dữ liệu không hợp lệ', details);
  }

  // Zod validation error
  if (error.name === 'ZodError') {
    const details = error.errors?.map(e => ({
      field: e.path.join('.'),
      message: e.message,
    }));
    return new ValidationError('Dữ liệu không hợp lệ', details);
  }

  return new BadRequestError(error.message);
}

/**
 * Map any error to AppError
 * @param {Error} error - Any error
 * @returns {AppError}
 */
function mapError(error) {
  // Already an AppError
  if (error instanceof AppError) {
    return error;
  }

  // Prisma errors
  if (error.code && error.code.startsWith('P')) {
    return mapPrismaError(error);
  }

  // JWT errors
  if (error.name && ['TokenExpiredError', 'JsonWebTokenError', 'NotBeforeError'].includes(error.name)) {
    return mapJwtError(error);
  }

  // Validation errors
  if (error.isJoi || error.name === 'ValidationError' || error.name === 'ZodError') {
    return mapValidationError(error);
  }

  // Generic errors
  return new InternalServerError(
    error.message || 'Đã xảy ra lỗi',
    { originalError: error.name }
  );
}

module.exports = {
  mapPrismaError,
  mapJwtError,
  mapValidationError,
  mapError,
};




