import { z } from 'zod';

/**
 * CreateNotificationTypeDto
 * Data Transfer Object for creating notification type
 * Follows Single Responsibility Principle (SRP)
 */

export interface CreateNotificationTypeInput {
  ten_loai_tb: string;
  mo_ta?: string | null;
}

class CreateNotificationTypeDto {
  static schema = z.object({
    ten_loai_tb: z.string().min(1, 'Tên loại thông báo là bắt buộc'),
    mo_ta: z.string().optional().nullable()
  });

  static fromRequest(body: unknown): CreateNotificationTypeInput {
    return this.schema.parse(body) as CreateNotificationTypeInput;
  }
}

export default CreateNotificationTypeDto;
module.exports = CreateNotificationTypeDto;
