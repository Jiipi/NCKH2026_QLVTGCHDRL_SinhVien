const { z } = require('zod');

/**
 * CreateActivityTypeDto
 * Data Transfer Object for creating activity type
 * Follows Single Responsibility Principle (SRP)
 */
class CreateActivityTypeDto {
  static schema = z.object({
    ten_loai_hd: z.string().min(1, 'Tên loại hoạt động không được để trống'),
    mo_ta: z.string().optional().nullable(),
    diem_mac_dinh: z.number().optional(),
    diem_toi_da: z.number().optional(),
    mau_sac: z.string().optional().nullable(),
    hinh_anh: z.string().optional().nullable()
  });

  static fromRequest(body) {
    return this.schema.parse(body);
  }
}

module.exports = CreateActivityTypeDto;

