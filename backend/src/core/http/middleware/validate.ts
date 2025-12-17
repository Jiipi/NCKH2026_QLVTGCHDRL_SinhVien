/**
 * Validation Middleware
 * Validates request data using validation schemas (Joi/Zod)
 * @module core/http/middleware/validate
 */

import { Request, Response, NextFunction } from 'express';
import { ZodSchema, ZodError, z } from 'zod';
import { ApiResponse, sendResponse } from '../response/apiResponse';

/**
 * Joi-like schema interface
 */
interface JoiSchema {
  validate: (data: unknown, options?: object) => {
    error?: {
      details: Array<{
        path: (string | number)[];
        message: string;
      }>;
    };
    value: unknown;
  };
}

/**
 * Union type for validation schemas
 */
type ValidationSchema = ZodSchema | JoiSchema;

/**
 * Request data source
 */
type DataSource = 'body' | 'query' | 'params';

/**
 * Validation error detail
 */
interface ValidationErrorDetail {
  field: string;
  message: string;
}

/**
 * Validate request data against a schema
 */
export function validate(schema: ValidationSchema, source: DataSource = 'body') {
  return (req: Request, res: Response, next: NextFunction): void | Response => {
    try {
      const data = req[source];

      // Joi validation
      if ('validate' in schema && typeof schema.validate === 'function') {
        const { error, value } = schema.validate(data, {
          abortEarly: false,
          stripUnknown: true,
        });

        if (error) {
          const details: ValidationErrorDetail[] = error.details.map(d => ({
            field: d.path.join('.'),
            message: d.message,
          }));
          return sendResponse(
            res,
            422,
            ApiResponse.validationError(details, 'Dữ liệu không hợp lệ')
          );
        }

        // Replace with validated/sanitized value
        (req as unknown as Record<string, unknown>)[source] = value;
        return next();
      }

      // Zod validation
      if ('safeParse' in schema) {
        const result = schema.safeParse(data);

        if (!result.success) {
          const details: ValidationErrorDetail[] = result.error.errors.map(e => ({
            field: e.path.join('.'),
            message: e.message,
          }));
          return sendResponse(
            res,
            422,
            ApiResponse.validationError(details, 'Dữ liệu không hợp lệ')
          );
        }

        // Replace with validated value
        (req as unknown as Record<string, unknown>)[source] = result.data;
        return next();
      }

      // Unknown schema type
      throw new Error('Invalid validation schema');
    } catch (error) {
      const err = error as Error;
      return sendResponse(
        res,
        500,
        ApiResponse.error('Lỗi validation', 500, err.message)
      );
    }
  };
}

/**
 * Validate request body
 */
export const validateBody = (schema: ValidationSchema) => validate(schema, 'body');

/**
 * Validate query parameters
 */
export const validateQuery = (schema: ValidationSchema) => validate(schema, 'query');

/**
 * Validate route parameters
 */
export const validateParams = (schema: ValidationSchema) => validate(schema, 'params');
