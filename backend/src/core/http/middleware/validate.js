/**
 * Validation Middleware
 * Validates request data using validation schemas (Joi/Zod)
 */

const { ValidationError } = require('../../errors/AppError');
const { ApiResponse, sendResponse } = require('../response/apiResponse');

/**
 * Validate request data against a schema
 * @param {object} schema - Validation schema (Joi or Zod)
 * @param {string} source - Data source ('body', 'query', 'params')
 * @returns {Function} - Middleware function
 */
function validate(schema, source = 'body') {
  return (req, res, next) => {
    try {
      const data = req[source];

      // Joi validation
      if (schema.validate) {
        const { error, value } = schema.validate(data, {
          abortEarly: false,
          stripUnknown: true,
        });

        if (error) {
          const details = error.details.map(d => ({
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
        req[source] = value;
        return next();
      }

      // Zod validation
      if (schema.parse || schema.safeParse) {
        const result = schema.safeParse(data);

        if (!result.success) {
          const details = result.error.errors.map(e => ({
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
        req[source] = result.data;
        return next();
      }

      // Unknown schema type
      throw new Error('Invalid validation schema');
    } catch (error) {
      return sendResponse(
        res,
        500,
        ApiResponse.error('Lỗi validation', 500, error.message)
      );
    }
  };
}

/**
 * Validate body
 * @param {object} schema - Validation schema
 * @returns {Function} - Middleware function
 */
const validateBody = (schema) => validate(schema, 'body');

/**
 * Validate query
 * @param {object} schema - Validation schema
 * @returns {Function} - Middleware function
 */
const validateQuery = (schema) => validate(schema, 'query');

/**
 * Validate params
 * @param {object} schema - Validation schema
 * @returns {Function} - Middleware function
 */
const validateParams = (schema) => validate(schema, 'params');

module.exports = {
  validate,
  validateBody,
  validateQuery,
  validateParams,
};




