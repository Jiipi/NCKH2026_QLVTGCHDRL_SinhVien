const { z } = require('zod');

const GENDER_OPTIONS = ['nam', 'nu', 'khac'];

const studentUpdateSchema = z.object({
  mssv: z.string().optional(),
  ngay_sinh: z.union([z.string(), z.date()]).optional(),
  gt: z.enum(GENDER_OPTIONS).optional(),
  dia_chi: z.string().optional(),
  sdt: z.string().optional(),
  lop_id: z.string().optional()
});

const createAdminUserSchema = z.object({
  maso: z.string().min(1, 'Mã số không được để trống'),
  hoten: z.string().min(1, 'Họ tên không được để trống'),
  email: z.string().email('Email không hợp lệ'),
  password: z.string().min(6, 'Mật khẩu phải có ít nhất 6 ký tự'),
  role: z.string(),
  mssv: z.string().optional(),
  lop_id: z.string().optional(),
  ngay_sinh: z.string().optional(),
  gt: z.enum(GENDER_OPTIONS).optional(),
  dia_chi: z.string().optional(),
  sdt: z.string().optional(),
  set_lop_truong: z.boolean().optional()
});

const updateAdminUserSchema = z.object({
  hoten: z.string().optional(),
  email: z.string().email().optional(),
  password: z.string().min(6).optional(),
  role: z.string().optional(),
  maso: z.string().min(3).optional(),
  trang_thai: z.enum(['hoat_dong', 'khong_hoat_dong', 'khoa']).optional(),
  student: studentUpdateSchema.optional(),
  set_lop_truong: z.boolean().optional()
});

module.exports = {
  createAdminUserSchema,
  updateAdminUserSchema,
  studentUpdateSchema
};

