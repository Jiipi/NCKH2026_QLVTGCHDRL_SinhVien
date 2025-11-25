/**
 * Auth Module Validators
 * Zod schemas for authentication input validation
 */

const { z } = require('zod');

/**
 * Login validation schema
 */
const loginSchema = z.object({
  body: z.object({
    maso: z.string().min(1, 'Mã số không được để trống'),
    password: z.string().min(1, 'Mật khẩu không được để trống'),
    remember: z.boolean().optional(),
  }),
});

/**
 * Register validation schema
 */
const registerSchema = z.object({
  body: z.object({
    maso: z.string().min(1, 'Mã số không được để trống'),
    email: z.string().email('Email không hợp lệ'),
    ho_ten: z.string().min(1, 'Họ tên không được để trống'),
    password: z.string().min(6, 'Mật khẩu phải có ít nhất 6 ký tự'),
    khoa: z.string().optional(),
    lop_id: z.string().uuid().optional(),
    lopId: z.string().uuid().optional(), // Support camelCase from frontend
    ngay_sinh: z.string().optional(), // Date string, will be converted to Date
    ngaySinh: z.string().optional(), // Support camelCase from frontend
    gioi_tinh: z.enum(['nam', 'nu', 'khac']).optional(),
    gioiTinh: z.enum(['nam', 'nu', 'khac']).optional(), // Support camelCase from frontend
    sdt: z.string().optional(),
    dia_chi: z.string().optional(),
    diaChi: z.string().optional(), // Support camelCase from frontend
  }),
});

/**
 * Change password validation schema
 */
const changePasswordSchema = z.object({
  body: z.object({
    currentPassword: z.string().min(1, 'Mật khẩu hiện tại không được để trống'),
    newPassword: z.string().min(6, 'Mật khẩu mới phải có ít nhất 6 ký tự'),
  }),
});

/**
 * Forgot password validation schema
 */
const forgotPasswordSchema = z.object({
  body: z.object({
    email: z.string().email('Email không hợp lệ'),
  }),
});

/**
 * Verify OTP validation schema
 */
const verifyOtpSchema = z.object({
  body: z.object({
    email: z.string().email('Email không hợp lệ'),
    otp: z.string().length(6, 'OTP phải có 6 ký tự'),
  }),
});

/**
 * Reset password with OTP validation schema
 */
const resetWithOtpSchema = z.object({
  body: z.object({
    email: z.string().email('Email không hợp lệ'),
    otp: z.string().length(6, 'OTP phải có 6 ký tự'),
    newPassword: z.string().min(6, 'Mật khẩu mới phải có ít nhất 6 ký tự'),
  }),
});

/**
 * Admin reset password validation schema
 */
const adminResetPasswordSchema = z.object({
  body: z.object({
    userId: z.string().uuid('ID người dùng không hợp lệ'),
    newPassword: z.string().min(6, 'Mật khẩu mới phải có ít nhất 6 ký tự'),
  }),
});

/**
 * Middleware to validate request using Zod schema
 */
const validate = (schema) => {
  return (req, res, next) => {
    try {
      schema.parse({
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

module.exports = {
  // Schemas
  loginSchema,
  registerSchema,
  changePasswordSchema,
  forgotPasswordSchema,
  verifyOtpSchema,
  resetWithOtpSchema,
  adminResetPasswordSchema,
  
  // Validation middleware
  validate,
  
  // Pre-configured validators
  validateLogin: validate(loginSchema),
  validateRegister: validate(registerSchema),
  validateChangePassword: validate(changePasswordSchema),
  validateForgotPassword: validate(forgotPasswordSchema),
  validateVerifyOtp: validate(verifyOtpSchema),
  validateResetWithOtp: validate(resetWithOtpSchema),
  validateAdminResetPassword: validate(adminResetPasswordSchema),
};

