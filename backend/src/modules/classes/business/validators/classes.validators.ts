/**
 * Classes Validators
 * Zod schemas for class validation
 */

import { z, ZodError, ZodSchema } from 'zod';
import type { Request, Response, NextFunction } from 'express';

/**
 * Validation error response item
 */
interface ValidationErrorItem {
  field: string;
  message: string;
}

/**
 * Middleware factory to validate requests with Zod schemas
 */
const validate = (schema: ZodSchema) => {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      await schema.parseAsync({
        body: req.body,
        query: req.query,
        params: req.params,
      });
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const errors: ValidationErrorItem[] = error.errors.map((err) => ({
          field: err.path.join('.'),
          message: err.message,
        }));
        res.status(400).json({
          success: false,
          message: 'Validation failed',
          errors,
        });
        return;
      }
      next(error);
    }
  };
};

// Query validation schemas
const getAllClassesSchema = z.object({
  query: z.object({
    page: z
      .string()
      .optional()
      .transform((val) => (val ? parseInt(val, 10) : 1))
      .refine((val) => val > 0, { message: 'Trang phải lớn hơn 0' }),
    limit: z
      .string()
      .optional()
      .transform((val) => (val ? parseInt(val, 10) : 10))
      .refine((val) => val > 0 && val <= 100, { message: 'Limit phải từ 1-100' }),
    search: z.string().optional(),
    khoa: z.string().optional(),
  }),
});

const getByIdSchema = z.object({
  params: z.object({
    id: z
      .string()
      .min(1, 'ID không được để trống')
      .transform((val) => parseInt(val, 10))
      .refine((val) => !isNaN(val) && val > 0, { message: 'ID phải là số dương' }),
  }),
});

// Create class schema
const createClassSchema = z.object({
  body: z.object({
    ma_lop: z
      .string()
      .min(1, 'Mã lớp không được để trống')
      .max(50, 'Mã lớp không quá 50 ký tự'),
    
    ten_lop: z
      .string()
      .min(1, 'Tên lớp không được để trống')
      .max(100, 'Tên lớp không quá 100 ký tự'),
    
    khoa: z
      .string()
      .min(1, 'Khoa không được để trống')
      .max(100, 'Khoa không quá 100 ký tự')
      .optional()
      .nullable(),
    
    khoa_hoc: z
      .string()
      .max(50, 'Khóa học không quá 50 ký tự')
      .optional()
      .nullable(),
    
    gvcn_id: z
      .number()
      .int()
      .positive()
      .or(z.string().transform((val) => parseInt(val, 10)))
      .optional()
      .nullable(),
  }),
});

// Update class schema
const updateClassSchema = z.object({
  params: getByIdSchema.shape.params,
  body: z.object({
    ma_lop: z
      .string()
      .min(1)
      .max(50)
      .optional(),
    
    ten_lop: z
      .string()
      .min(1)
      .max(100)
      .optional(),
    
    khoa: z
      .string()
      .max(100)
      .optional()
      .nullable(),
    
    khoa_hoc: z
      .string()
      .max(50)
      .optional()
      .nullable(),
    
    gvcn_id: z
      .number()
      .int()
      .positive()
      .or(z.string().transform((val) => parseInt(val, 10)))
      .optional()
      .nullable(),
  }),
});

// Assign teacher schema
const assignTeacherSchema = z.object({
  params: getByIdSchema.shape.params,
  body: z.object({
    teacherId: z
      .number()
      .int()
      .positive('Teacher ID không hợp lệ')
      .or(z.string().transform((val) => parseInt(val, 10))),
  }),
});

// Pre-configured validators
const validateGetAll = validate(getAllClassesSchema);
const validateGetById = validate(getByIdSchema);
const validateCreate = validate(createClassSchema);
const validateUpdate = validate(updateClassSchema);
const validateAssignTeacher = validate(assignTeacherSchema);

// Export middleware validators
export {
  // Schemas
  getAllClassesSchema,
  getByIdSchema,
  createClassSchema,
  updateClassSchema,
  assignTeacherSchema,

  // Validation middleware
  validate,

  // Pre-configured validators
  validateGetAll,
  validateGetById,
  validateCreate,
  validateUpdate,
  validateAssignTeacher,
};

export default {
  getAllClassesSchema,
  getByIdSchema,
  createClassSchema,
  updateClassSchema,
  assignTeacherSchema,
  validate,
  validateGetAll,
  validateGetById,
  validateCreate,
  validateUpdate,
  validateAssignTeacher,
};

module.exports = {
  getAllClassesSchema,
  getByIdSchema,
  createClassSchema,
  updateClassSchema,
  assignTeacherSchema,
  validate,
  validateGetAll,
  validateGetById,
  validateCreate,
  validateUpdate,
  validateAssignTeacher,
};
