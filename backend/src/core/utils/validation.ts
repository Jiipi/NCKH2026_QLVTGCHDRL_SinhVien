/**
 * Validation Utilities
 * Zod schemas for request validation
 * @module core/utils/validation
 */

import { z, ZodSchema, ZodError } from 'zod';
import { Request, Response, NextFunction } from 'express';

// ============== Auth Schemas ==============

/**
 * Login schema
 */
export const loginSchema = z.object({
  maso: z.string().min(1, 'Mã số là bắt buộc'),
  password: z.string().min(6, 'Mật khẩu phải có ít nhất 6 ký tự'),
  // Ghi nhớ đăng nhập (tùy chọn)
  remember: z.boolean().optional()
});

/**
 * Register schema
 */
export const registerSchema = z.object({
  name: z.string().min(2, 'Họ và tên phải có ít nhất 2 ký tự'),
  maso: z.string().regex(/^\d{7}$/, 'Mã số sinh viên phải có đúng 7 chữ số'),
  email: z.string().email('Email không hợp lệ'),
  password: z.string().min(6, 'Mật khẩu phải có ít nhất 6 ký tự'),
  confirmPassword: z.string(),
  lopId: z.string().uuid('Lớp không hợp lệ').optional().or(z.literal('')), // Cho phép empty string
  khoa: z.string().min(1, 'Khoa là bắt buộc').optional().or(z.literal('')), // Cho phép empty string như lopId
  // Thêm các trường sinh viên
  ngaySinh: z.string().optional(), // ISO date string
  gioiTinh: z.enum(['nam', 'nu', 'khac']).optional(),
  diaChi: z.string().optional(),
  sdt: z.string().max(10, 'Số điện thoại không hợp lệ').optional().or(z.literal('')) // Cho phép empty string
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Mật khẩu xác nhận không khớp',
  path: ['confirmPassword']
});

/**
 * Update user schema
 */
export const updateUserSchema = z.object({
  name: z.string().min(2, 'Họ và tên phải có ít nhất 2 ký tự'),
  email: z.string().email('Email không hợp lệ').optional()
});

// ============== Password Recovery Schemas (U3) ==============

/**
 * Forgot password schema - OTP-based
 */
export const forgotPasswordSchema = z.object({
  email: z.string().email('Email không hợp lệ')
});

/**
 * Verify OTP schema
 */
export const verifyOtpSchema = z.object({
  email: z.string().email('Email không hợp lệ'),
  code: z.string().length(6, 'Mã gồm 6 chữ số').regex(/^\d{6}$/, 'Mã OTP không hợp lệ')
});

/**
 * Reset password with OTP schema
 */
export const resetWithOtpSchema = z.object({
  email: z.string().email('Email không hợp lệ'),
  code: z.string().length(6, 'Mã gồm 6 chữ số').regex(/^\d{6}$/, 'Mã OTP không hợp lệ'),
  password: z.string().min(6, 'Mật khẩu phải có ít nhất 6 ký tự'),
  confirmPassword: z.string()
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Mật khẩu xác nhận không khớp',
  path: ['confirmPassword']
});

/**
 * Admin reset password schema
 */
export const adminResetPasswordSchema = z.object({
  userId: z.string().uuid('userId không hợp lệ'),
  newPassword: z.string().min(6, 'Mật khẩu phải có ít nhất 6 ký tự')
});

/**
 * Change password schema (when logged in)
 */
export const changePasswordSchema = z.object({
  currentPassword: z.string().min(6, 'Mật khẩu hiện tại không hợp lệ'),
  newPassword: z.string().min(6, 'Mật khẩu mới phải có ít nhất 6 ký tự'),
  confirmNewPassword: z.string()
}).refine((d) => d.newPassword === d.confirmNewPassword, {
  message: 'Mật khẩu xác nhận không khớp',
  path: ['confirmNewPassword']
});

// ============== Validation Middleware ==============

/**
 * Extended Request with validated data
 */
export interface ValidatedRequest<T = unknown> extends Request {
  validatedData?: T;
}

/**
 * Validation error response format
 */
export interface ValidationErrorResponse {
  field: string;
  message: string;
}

/**
 * Create validation middleware for a schema
 */
export function validate<T extends ZodSchema>(schema: T) {
  return (req: ValidatedRequest<z.infer<T>>, res: Response, next: NextFunction): void => {
    try {
      const validatedData = schema.parse(req.body);
      req.validatedData = validatedData;
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const errors: ValidationErrorResponse[] = error.errors.map(err => ({
          field: err.path.join('.'),
          message: err.message
        }));

        res.status(400).json({
          success: false,
          message: 'Validation failed',
          errors
        });
        return;
      }
      next(error);
    }
  };
}

// ============== Sanitization ==============

/**
 * Sanitize input data - recursively clean strings
 */
export function sanitizeInput<T>(data: T): T {
  if (typeof data === 'string') {
    return data.trim().replace(/[<>]/g, '') as T;
  }
  // Preserve arrays as arrays and sanitize each element
  if (Array.isArray(data)) {
    return data.map((item) => sanitizeInput(item)) as T;
  }
  if (typeof data === 'object' && data !== null) {
    const sanitized: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(data)) {
      sanitized[key] = sanitizeInput(value);
    }
    return sanitized as T;
  }
  return data;
}

// ============== Type Exports ==============

export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;
export type UpdateUserInput = z.infer<typeof updateUserSchema>;
export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>;
export type VerifyOtpInput = z.infer<typeof verifyOtpSchema>;
export type ResetWithOtpInput = z.infer<typeof resetWithOtpSchema>;
export type AdminResetPasswordInput = z.infer<typeof adminResetPasswordSchema>;
export type ChangePasswordInput = z.infer<typeof changePasswordSchema>;

// CommonJS compatibility
module.exports = {
  loginSchema,
  registerSchema,
  updateUserSchema,
  forgotPasswordSchema,
  verifyOtpSchema,
  resetWithOtpSchema,
  adminResetPasswordSchema,
  changePasswordSchema,
  validate,
  sanitizeInput
};
