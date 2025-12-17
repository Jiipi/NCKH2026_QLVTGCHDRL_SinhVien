/**
 * Auth Module Validators
 * Zod schemas for authentication input validation
 */

import { z, ZodSchema } from 'zod';
import { Request, Response, NextFunction } from 'express';

/**
 * Login validation schema
 */
export const loginSchema = z.object({
  body: z.object({
    maso: z.string().min(1, 'Mã số không được để trống'),
    password: z.string().min(1, 'Mật khẩu không được để trống'),
    remember: z.boolean().optional(),
  }),
});

/**
 * Register validation schema
 */
export const registerSchema = z.object({
  body: z.object({
    maso: z.string().min(1, 'Mã số không được để trống'),
    email: z.string().email('Email không hợp lệ'),
    ho_ten: z.string().min(1, 'Họ tên không được để trống'),
    password: z.string().min(6, 'Mật khẩu phải có ít nhất 6 ký tự'),
    khoa: z.string().optional(),
    lop_id: z.string().uuid().optional(),
    lopId: z.string().uuid().optional(),
    ngay_sinh: z.string().optional(),
    ngaySinh: z.string().optional(),
    gioi_tinh: z.enum(['nam', 'nu', 'khac']).optional(),
    gioiTinh: z.enum(['nam', 'nu', 'khac']).optional(),
    sdt: z.string().optional(),
    dia_chi: z.string().optional(),
    diaChi: z.string().optional(),
  }),
});

/**
 * Change password validation schema
 */
export const changePasswordSchema = z.object({
  body: z.object({
    currentPassword: z.string().min(1, 'Mật khẩu hiện tại không được để trống'),
    newPassword: z.string().min(6, 'Mật khẩu mới phải có ít nhất 6 ký tự'),
  }),
});

/**
 * Forgot password validation schema
 */
export const forgotPasswordSchema = z.object({
  body: z.object({
    email: z.string().email('Email không hợp lệ'),
  }),
});

/**
 * Verify OTP validation schema
 */
export const verifyOtpSchema = z.object({
  body: z.object({
    email: z.string().email('Email không hợp lệ'),
    otp: z.string().length(6, 'OTP phải có 6 ký tự'),
  }),
});

/**
 * Reset password with OTP validation schema
 */
export const resetWithOtpSchema = z.object({
  body: z.object({
    email: z.string().email('Email không hợp lệ'),
    otp: z.string().length(6, 'OTP phải có 6 ký tự'),
    newPassword: z.string().min(6, 'Mật khẩu mới phải có ít nhất 6 ký tự'),
  }),
});

/**
 * Admin reset password validation schema
 */
export const adminResetPasswordSchema = z.object({
  body: z.object({
    userId: z.string().uuid('ID người dùng không hợp lệ'),
    newPassword: z.string().min(6, 'Mật khẩu mới phải có ít nhất 6 ký tự'),
  }),
});

interface ValidationError {
  field: string;
  message: string;
}

/**
 * Middleware to validate request using Zod schema
 */
export const validate = (schema: ZodSchema) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    try {
      schema.parse({
        body: req.body,
        query: req.query,
        params: req.params,
      });
      next();
    } catch (error) {
      if (error instanceof z.ZodError) {
        const errors: ValidationError[] = error.errors.map((err) => ({
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

// Pre-configured validators
export const validateLogin = validate(loginSchema);
export const validateRegister = validate(registerSchema);
export const validateChangePassword = validate(changePasswordSchema);
export const validateForgotPassword = validate(forgotPasswordSchema);
export const validateVerifyOtp = validate(verifyOtpSchema);
export const validateResetWithOtp = validate(resetWithOtpSchema);
export const validateAdminResetPassword = validate(adminResetPasswordSchema);

export default {
  loginSchema,
  registerSchema,
  changePasswordSchema,
  forgotPasswordSchema,
  verifyOtpSchema,
  resetWithOtpSchema,
  adminResetPasswordSchema,
  validate,
  validateLogin,
  validateRegister,
  validateChangePassword,
  validateForgotPassword,
  validateVerifyOtp,
  validateResetWithOtp,
  validateAdminResetPassword,
};
