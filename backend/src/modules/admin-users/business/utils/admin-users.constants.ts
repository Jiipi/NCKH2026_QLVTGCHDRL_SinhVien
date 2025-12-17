/**
 * Admin Users Constants
 */

export const ROLE_ALIASES: Record<string, string> = {
  ADMIN: 'ADMIN',
  QUAN_TRI: 'ADMIN',
  QUANTRI: 'ADMIN',
  GIANG_VIEN: 'GIANG_VIEN',
  GIANGVIEN: 'GIANG_VIEN',
  GIAO_VIEN: 'GIANG_VIEN',
  GIAOVIEN: 'GIANG_VIEN',
  GIAO_CHU: 'GIANG_VIEN',
  GIANG: 'GIANG_VIEN',
  TEACHER: 'GIANG_VIEN',
  GV: 'GIANG_VIEN',
  LOP_TRUONG: 'LOP_TRUONG',
  LOPTRUONG: 'LOP_TRUONG',
  CLASS_MONITOR: 'LOP_TRUONG',
  CLASSMONITOR: 'LOP_TRUONG',
  LT: 'LOP_TRUONG',
  SINH_VIEN: 'SINH_VIEN',
  SINHVIEN: 'SINH_VIEN',
  STUDENT: 'SINH_VIEN',
  SV: 'SINH_VIEN'
};

export const TEACHER_ROLE_VARIANTS: string[] = [
  'GIANG_VIEN',
  'GIANG VIEN',
  'Giảng viên',
  'GIẢNG_VIÊN',
  'GV'
];

export const CSV_HEADERS: string[] = ['Maso', 'HoTen', 'Email', 'VaiTro', 'TrangThai', 'Lop', 'Khoa', 'NgayTao'];

module.exports = {
  ROLE_ALIASES,
  TEACHER_ROLE_VARIANTS,
  CSV_HEADERS
};
