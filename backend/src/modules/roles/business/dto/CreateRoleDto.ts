import { z } from 'zod';
import type { VaiTro } from '@prisma/client';

/**
 * CreateRoleDto
 * Data Transfer Object for creating role
 * Follows Single Responsibility Principle (SRP)
 */

export interface CreateRoleInput {
  ten_vt: string;
  mo_ta?: string | null;
  quyen_han?: string[] | Record<string, unknown> | null;
}

export type CreateRoleOutput = Pick<VaiTro, 'ten_vt' | 'mo_ta' | 'quyen_han'>;

class CreateRoleDto {
  static schema = z.object({
    ten_vt: z.string().min(1, 'Tên vai trò là bắt buộc'),
    mo_ta: z.string().optional().nullable(),
    quyen_han: z.union([z.array(z.string()), z.record(z.unknown())]).optional().nullable()
  });

  static fromRequest(body: unknown): CreateRoleOutput {
    return this.schema.parse(body) as CreateRoleOutput;
  }
}

export default CreateRoleDto;
module.exports = CreateRoleDto;
