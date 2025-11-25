const ROLE_ALIASES = {
  Admin: 'ADMIN',
  ADMIN: 'ADMIN',
  'Giảng viên': 'GIẢNG_VIÊN',
  'GIẢNG_VIÊN': 'GIẢNG_VIÊN',
  'Giang vien': 'GIẢNG_VIÊN',
  'Lớp trưởng': 'LỚP_TRƯỞNG',
  'LỚP_TRƯỞNG': 'LỚP_TRƯỞNG',
  'Sinh viên': 'SINH_VIÊN',
  'SINH_VIÊN': 'SINH_VIÊN'
};

const TEACHER_ROLE_VARIANTS = [
  'GIANG_VIEN',
  'GIANG VIEN',
  'Giảng viên',
  'GIẢNG_VIÊN',
  'GV'
];

const CSV_HEADERS = ['Maso', 'HoTen', 'Email', 'VaiTro', 'TrangThai', 'Lop', 'Khoa', 'NgayTao'];

module.exports = {
  ROLE_ALIASES,
  TEACHER_ROLE_VARIANTS,
  CSV_HEADERS
};

