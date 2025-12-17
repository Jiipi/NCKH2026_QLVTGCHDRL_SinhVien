import { z } from 'zod';

/**
 * CreateActivityTypeDto
 * Data Transfer Object for creating activity type
 * Follows Single Responsibility Principle (SRP)
 */

export const CreateActivityTypeDtoSchema = z.object({
  ten_loai_hd: z.string().min(1, 'Tên loại hoạt động không được để trống'),
  mo_ta: z.string().optional().nullable(),
  diem_mac_dinh: z.number().optional(),
  diem_toi_da: z.number().optional(),
  mau_sac: z.string().optional().nullable(),
  hinh_anh: z.string().optional().nullable()
});

export type CreateActivityTypeInput = z.infer<typeof CreateActivityTypeDtoSchema>;

class CreateActivityTypeDto {
  static schema = CreateActivityTypeDtoSchema;

  static fromRequest(body: unknown): CreateActivityTypeInput {
    return this.schema.parse(body);
  }
}

export default CreateActivityTypeDto;
module.exports = CreateActivityTypeDto;
