/**
 * Classes Validators
 * Zod schemas for class validation
 */

const { z } = require('zod');

/**
 * Middleware factory to validate requests with Zod schemas
 */
const validate = (schema) => {
  return async (req, res, next) => {
    try {
      await schema.parseAsync({
        body: req.body,
        query: req.query,
        params: req.params,
      });
      next();
    } catch (error) {
      if (error instanceof z.ZodError) {
        const errors = error.errors.map((err) => ({
          field: err.path.join('.'),
          message: err.message,
        }));
        return res.status(400).json({
          success: false,
          message: 'Validation failed',
          errors,
        });
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

// Export middleware validators
module.exports = {
  // Schemas
  getAllClassesSchema,
  getByIdSchema,
  createClassSchema,
  updateClassSchema,
  assignTeacherSchema,

  // Validation middleware
  validate,

  // Pre-configured validators
  validateGetAll: validate(getAllClassesSchema),
  validateGetById: validate(getByIdSchema),
  validateCreate: validate(createClassSchema),
  validateUpdate: validate(updateClassSchema),
  validateAssignTeacher: validate(assignTeacherSchema),
};
