/**
 * Activities Validators
 * Zod schemas for activity validation
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
        // Log validation errors for debugging
        console.error('❌ Validation failed:', {
          errors,
          body: req.body,
          query: req.query,
          params: req.params,
        });
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
const activityStatusEnum = z.enum(['cho_duyet', 'da_duyet', 'tu_choi'], {
  errorMap: () => ({ message: 'Trạng thái không hợp lệ' }),
});

const activityScopeEnum = z.enum(['toan_truong', 'khoa', 'lop'], {
  errorMap: () => ({ message: 'Phạm vi không hợp lệ' }),
});

const dateString = z
  .string()
  .refine((val) => !isNaN(Date.parse(val)), {
    message: 'Ngày không hợp lệ',
  })
  .transform((val) => new Date(val));

// Query validation schemas
const getAllActivitiesSchema = z.object({
  query: z.object({
    page: z
      .string()
      .optional()
      .transform((val) => (val ? parseInt(val, 10) : 1))
      .refine((val) => val > 0, { message: 'Trang phải lớn hơn 0' }),
    limit: z
      .string()
      .optional()
      .transform((val) => {
        if (val === 'all') return 'all'; // Allow 'all' for unlimited results
        return val ? parseInt(val, 10) : 10;
      })
      .refine((val) => {
        if (val === 'all') return true;
        return val > 0 && val <= 100;
      }, { message: 'Limit phải từ 1-100 hoặc "all"' }),
    search: z.string().optional(),
    q: z.string().optional(), // Alias for search
    // Allow both activity status enum AND time-based status (open, soon, closed)
    status: z.enum(['cho_duyet', 'da_duyet', 'tu_choi', 'open', 'soon', 'closed']).optional(),
    type: z.string().optional(),
    semester: z.string().optional(),
    semesterValue: z.string().optional(),
    from: z.string().optional(),
    to: z.string().optional(),
    sort: z.string().optional(),
    order: z.enum(['asc', 'desc']).optional(),
  }),
});

const getByIdSchema = z.object({
  params: z.object({
    id: z
      .string()
      .min(1, 'ID không được để trống')
      // ✅ Allow UUID format (not just integer)
      .refine((val) => {
        // Check if it's a valid UUID or integer
        const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
        const isInt = !isNaN(parseInt(val, 10)) && parseInt(val, 10) > 0;
        return uuidRegex.test(val) || isInt;
      }, { message: 'ID phải là UUID hoặc số dương' }),
  }),
});

// Create activity schema
const createActivitySchema = z.object({
  body: z.object({
    ten_hoat_dong: z
      .string()
      .min(3, 'Tên hoạt động phải có ít nhất 3 ký tự')
      .max(255, 'Tên hoạt động không quá 255 ký tự'),
    
    mo_ta: z
      .string()
      .max(2000, 'Mô tả không quá 2000 ký tự')
      .optional()
      .nullable(),
    
    loai_hoat_dong_id: z
      .string()
      .min(1, 'Loại hoạt động không được để trống')
      .or(z.number().int().positive()),
    
    ngay_bat_dau: dateString,
    
    ngay_ket_thuc: dateString,
    
    dia_diem: z
      .string()
      .min(1, 'Địa điểm không được để trống')
      .max(255, 'Địa điểm không quá 255 ký tự')
      .optional()
      .nullable(),
    
    so_luong_toi_da: z
      .number()
      .int()
      .positive('Số lượng tối đa phải là số dương')
      .or(z.string().transform((val) => parseInt(val, 10)))
      .optional()
      .nullable(),
    
    diem_ren_luyen: z
      .number()
      .int()
      .min(0, 'Điểm rèn luyện phải từ 0 trở lên')
      .max(100, 'Điểm rèn luyện không quá 100')
      .or(z.string().transform((val) => parseInt(val, 10)))
      .optional()
      .nullable(),
    
    pham_vi: activityScopeEnum,
    
    khoa_id: z
      .number()
      .int()
      .positive()
      .or(z.string().transform((val) => parseInt(val, 10)))
      .optional()
      .nullable(),
    
    lop_id: z
      .number()
      .int()
      .positive()
      .or(z.string().transform((val) => parseInt(val, 10)))
      .optional()
      .nullable(),
    
    // Semester fields (required)
    hoc_ky: z
      .string()
      .min(1, 'Học kỳ không được để trống'),
    
    nam_hoc: z
      .string()
      .min(1, 'Năm học không được để trống'),
    
    trang_thai: activityStatusEnum.optional().default('cho_duyet'),
  }).refine(
    (data) => {
      // Validate date range
      return new Date(data.ngay_ket_thuc) >= new Date(data.ngay_bat_dau);
    },
    {
      message: 'Ngày kết thúc phải sau hoặc bằng ngày bắt đầu',
      path: ['ngay_ket_thuc'],
    }
  ).refine(
    (data) => {
      // If scope is khoa, khoa_id is required
      if (data.pham_vi === 'khoa') {
        return !!data.khoa_id;
      }
      return true;
    },
    {
      message: 'Khoa ID bắt buộc khi phạm vi là khoa',
      path: ['khoa_id'],
    }
  ).refine(
    (data) => {
      // If scope is lop, lop_id is required
      if (data.pham_vi === 'lop') {
        return !!data.lop_id;
      }
      return true;
    },
    {
      message: 'Lớp ID bắt buộc khi phạm vi là lớp',
      path: ['lop_id'],
    }
  ),
});

// Update activity schema (all fields optional except dates validation)
const updateActivitySchema = z.object({
  params: getByIdSchema.shape.params,
  body: z.object({
    ten_hoat_dong: z
      .string()
      .min(3, 'Tên hoạt động phải có ít nhất 3 ký tự')
      .max(255, 'Tên hoạt động không quá 255 ký tự')
      .optional(),
    
    mo_ta: z
      .string()
      .max(2000, 'Mô tả không quá 2000 ký tự')
      .optional()
      .nullable(),
    
    loai_hoat_dong_id: z
      .string()
      .min(1, 'Loại hoạt động không được để trống')
      .or(z.number().int().positive())
      .optional(),
    
    ngay_bat_dau: dateString.optional(),
    
    ngay_ket_thuc: dateString.optional(),
    
    dia_diem: z
      .string()
      .min(1, 'Địa điểm không được để trống')
      .max(255, 'Địa điểm không quá 255 ký tự')
      .optional()
      .nullable(),
    
    so_luong_toi_da: z
      .number()
      .int()
      .positive()
      .or(z.string().transform((val) => parseInt(val, 10)))
      .optional()
      .nullable(),
    
    diem_ren_luyen: z
      .number()
      .int()
      .min(0)
      .max(100)
      .or(z.string().transform((val) => parseInt(val, 10)))
      .optional()
      .nullable(),
    
    pham_vi: activityScopeEnum.optional(),
    
    khoa_id: z
      .number()
      .int()
      .positive()
      .or(z.string().transform((val) => parseInt(val, 10)))
      .optional()
      .nullable(),
    
    lop_id: z
      .number()
      .int()
      .positive()
      .or(z.string().transform((val) => parseInt(val, 10)))
      .optional()
      .nullable(),
    
    // Semester fields (optional for update)
    hoc_ky: z
      .string()
      .min(1, 'Học kỳ không được để trống')
      .optional(),
    
    nam_hoc: z
      .string()
      .min(1, 'Năm học không được để trống')
      .optional(),
    
    trang_thai: activityStatusEnum.optional(),
  }).refine(
    (data) => {
      // Validate date range if both dates provided
      if (data.ngay_bat_dau && data.ngay_ket_thuc) {
        return new Date(data.ngay_ket_thuc) >= new Date(data.ngay_bat_dau);
      }
      return true;
    },
    {
      message: 'Ngày kết thúc phải sau hoặc bằng ngày bắt đầu',
      path: ['ngay_ket_thuc'],
    }
  ),
});

// Approve/Reject schemas
const approveActivitySchema = z.object({
  params: getByIdSchema.shape.params,
});

const rejectActivitySchema = z.object({
  params: getByIdSchema.shape.params,
  body: z.object({
    reason: z
      .string()
      .min(10, 'Lý do từ chối phải có ít nhất 10 ký tự')
      .max(500, 'Lý do từ chối không quá 500 ký tự')
      .optional()
      .nullable(),
  }),
});

// Register schema
const registerActivitySchema = z.object({
  params: getByIdSchema.shape.params,
});

// Export middleware validators
module.exports = {
  // Schemas
  getAllActivitiesSchema,
  getByIdSchema,
  createActivitySchema,
  updateActivitySchema,
  approveActivitySchema,
  rejectActivitySchema,
  registerActivitySchema,

  // Validation middleware
  validate,

  // Pre-configured validators
  validateGetAll: validate(getAllActivitiesSchema),
  validateGetById: validate(getByIdSchema),
  validateCreate: validate(createActivitySchema),
  validateUpdate: validate(updateActivitySchema),
  validateApprove: validate(approveActivitySchema),
  validateReject: validate(rejectActivitySchema),
  validateRegister: validate(registerActivitySchema),
};
