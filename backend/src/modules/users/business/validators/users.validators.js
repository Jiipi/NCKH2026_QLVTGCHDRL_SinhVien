/**
 * Users Validators
 * Zod schemas for user validation
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

// Reusable schemas
const roleEnum = z.enum(['ADMIN', 'GIANG_VIEN', 'SINH_VIEN', 'LOP_TRUONG'], {
  errorMap: () => ({ message: 'Vai trò không hợp lệ' }),
});

const emailSchema = z.string().email('Email không hợp lệ');

const maSoSchema = z.string().min(1, 'Mã số không được để trống').max(20, 'Mã số không quá 20 ký tự');

// Query validation schemas
const getAllUsersSchema = z.object({
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
    role: roleEnum.optional(),
    khoa: z.string().optional(),
    lop: z.string().optional(),
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

const searchUsersSchema = z.object({
  query: z.object({
    q: z.string().min(1, 'Từ khóa tìm kiếm không được để trống'),
  }),
});

const getByClassSchema = z.object({
  params: z.object({
    className: z.string().min(1, 'Tên lớp không được để trống'),
  }),
});

// Create user schema
const createUserSchema = z.object({
  body: z.object({
    maso: maSoSchema,
    
    email: emailSchema,
    
    ho_ten: z
      .string()
      .min(1, 'Họ tên không được để trống')
      .max(100, 'Họ tên không quá 100 ký tự'),
    
    password: z
      .string()
      .min(6, 'Mật khẩu phải có ít nhất 6 ký tự')
      .max(100, 'Mật khẩu không quá 100 ký tự'),
    
    vai_tro_id: z
      .number()
      .int()
      .positive('Vai trò ID không hợp lệ')
      .or(z.string().transform((val) => parseInt(val, 10))),
    
    khoa: z.string().max(100, 'Khoa không quá 100 ký tự').optional().nullable(),
    
    lop_id: z
      .number()
      .int()
      .positive()
      .or(z.string().transform((val) => parseInt(val, 10)))
      .optional()
      .nullable(),
    
    ngay_sinh: z
      .string()
      .refine((val) => !isNaN(Date.parse(val)), { message: 'Ngày sinh không hợp lệ' })
      .transform((val) => new Date(val))
      .optional()
      .nullable(),
    
    gioi_tinh: z.enum(['Nam', 'Nữ', 'Khác']).optional().nullable(),
    
    sdt: z
      .string()
      .regex(/^[0-9]{10,11}$/, 'Số điện thoại phải có 10-11 chữ số')
      .optional()
      .nullable(),
    
    dia_chi: z.string().max(255, 'Địa chỉ không quá 255 ký tự').optional().nullable(),
  }),
});

// Update user schema (all fields optional)
const updateUserSchema = z.object({
  params: getByIdSchema.shape.params,
  body: z.object({
    email: emailSchema.optional(),
    
    ho_ten: z
      .string()
      .min(1, 'Họ tên không được để trống')
      .max(100, 'Họ tên không quá 100 ký tự')
      .optional(),
    
    password: z
      .string()
      .min(6, 'Mật khẩu phải có ít nhất 6 ký tự')
      .max(100, 'Mật khẩu không quá 100 ký tự')
      .optional(),
    
    vai_tro_id: z
      .number()
      .int()
      .positive()
      .or(z.string().transform((val) => parseInt(val, 10)))
      .optional(),
    
    khoa: z.string().max(100).optional().nullable(),
    
    lop_id: z
      .number()
      .int()
      .positive()
      .or(z.string().transform((val) => parseInt(val, 10)))
      .optional()
      .nullable(),
    
    ngay_sinh: z
      .string()
      .refine((val) => !isNaN(Date.parse(val)), { message: 'Ngày sinh không hợp lệ' })
      .transform((val) => new Date(val))
      .optional()
      .nullable(),
    
    gioi_tinh: z.enum(['Nam', 'Nữ', 'Khác']).optional().nullable(),
    
    sdt: z
      .string()
      .regex(/^[0-9]{10,11}$/, 'Số điện thoại phải có 10-11 chữ số')
      .optional()
      .nullable(),
    
    dia_chi: z.string().max(255).optional().nullable(),
    
    anh_dai_dien: z.string().url('URL ảnh không hợp lệ').optional().nullable(),
    
    trang_thai_hoat_dong: z.boolean().optional(),
  }),
});

// Export middleware validators
module.exports = {
  // Schemas
  getAllUsersSchema,
  getByIdSchema,
  searchUsersSchema,
  getByClassSchema,
  createUserSchema,
  updateUserSchema,

  // Validation middleware
  validate,

  // Pre-configured validators
  validateGetAll: validate(getAllUsersSchema),
  validateGetById: validate(getByIdSchema),
  validateSearch: validate(searchUsersSchema),
  validateGetByClass: validate(getByClassSchema),
  validateCreate: validate(createUserSchema),
  validateUpdate: validate(updateUserSchema),
};
