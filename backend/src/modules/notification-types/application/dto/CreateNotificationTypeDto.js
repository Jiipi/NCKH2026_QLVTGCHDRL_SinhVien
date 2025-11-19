const { z } = require('zod');

/**
 * CreateNotificationTypeDto
 * Data Transfer Object for creating notification type
 * Follows Single Responsibility Principle (SRP)
 */
class CreateNotificationTypeDto {
  static schema = z.object({
    ten_loai_tb: z.string().min(1, 'Tên loại thông báo là bắt buộc'),
    mo_ta: z.string().optional().nullable()
  });

  static fromRequest(body) {
    return this.schema.parse(body);
  }
}

module.exports = CreateNotificationTypeDto;

