import { z } from 'zod';

/**
 * ChangePasswordDto
 * Data Transfer Object for changing password
 * Follows Single Responsibility Principle (SRP)
 */

export interface ChangePasswordData {
  old_password: string;
  new_password: string;
  confirm_password: string;
}

class ChangePasswordDto {
  static schema = z.object({
    old_password: z.string().min(1, 'Mật khẩu cũ là bắt buộc'),
    new_password: z.string().min(6, 'Mật khẩu mới phải có ít nhất 6 ký tự'),
    confirm_password: z.string()
  }).refine((data) => data.new_password === data.confirm_password, {
    message: "Mật khẩu xác nhận không khớp",
    path: ["confirm_password"],
  });

  static fromRequest(body: unknown): ChangePasswordData {
    return this.schema.parse(body) as ChangePasswordData;
  }
}

export default ChangePasswordDto;
module.exports = ChangePasswordDto;
