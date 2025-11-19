const { z } = require('zod');

/**
 * UpdateProfileDto
 * Data Transfer Object for updating profile
 * Follows Single Responsibility Principle (SRP)
 */
class UpdateProfileDto {
  static schema = z.object({
    ho_ten: z.string().min(2, 'Họ tên phải có ít nhất 2 ký tự').optional(),
    email: z.string().email('Email không hợp lệ').optional(),
    anh_dai_dien: z.string().refine((val) => {
      if (!val) return true;
      const isValidFormat = val.startsWith('/') || val.startsWith('http://') || val.startsWith('https://') || val.startsWith('data:');
      const isValidLength = val.length <= 255;
      return isValidFormat && isValidLength;
    }, 'URL ảnh đại diện không hợp lệ hoặc quá dài (tối đa 255 ký tự)').optional(),
    ngay_sinh: z.string().optional(),
    gt: z.enum(['nam', 'nu', 'khac']).optional(),
    dia_chi: z.string().optional(),
    sdt: z.string().min(10, 'Số điện thoại phải có ít nhất 10 ký tự').max(11).optional()
  });

  static fromRequest(body) {
    return this.schema.parse(body);
  }
}

module.exports = UpdateProfileDto;

