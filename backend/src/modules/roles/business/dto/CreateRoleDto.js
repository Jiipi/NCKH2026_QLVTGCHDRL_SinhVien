const { z } = require('zod');

/**
 * CreateRoleDto
 * Data Transfer Object for creating role
 * Follows Single Responsibility Principle (SRP)
 */
class CreateRoleDto {
  static schema = z.object({
    ten_vt: z.string().min(1, 'Tên vai trò là bắt buộc'),
    mo_ta: z.string().optional().nullable(),
    quyen_han: z.union([z.array(z.string()), z.record(z.any())]).optional().nullable()
  });

  static fromRequest(body) {
    return this.schema.parse(body);
  }
}

module.exports = CreateRoleDto;

