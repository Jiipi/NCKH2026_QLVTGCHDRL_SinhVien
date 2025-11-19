const { z } = require('zod');

/**
 * ChangePasswordDto
 * Data Transfer Object for changing password
 * Follows Single Responsibility Principle (SRP)
 */
class ChangePasswordDto {
  static schema = z.object({
    old_password: z.string().min(1, 'Mật khẩu cũ là bắt buộc'),
    new_password: z.string().min(6, 'Mật khẩu mới phải có ít nhất 6 ký tự'),
    confirm_password: z.string()
  }).refine((data) => data.new_password === data.confirm_password, {
    message: "Mật khẩu xác nhận không khớp",
    path: ["confirm_password"],
  });

  static fromRequest(body) {
    return this.schema.parse(body);
  }
}

module.exports = ChangePasswordDto;

