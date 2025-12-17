import type { VaiTro } from '@prisma/client';

/**
 * Request body interface for updating a user
 */
export interface UpdateUserRequestBody {
  fullName?: string;
  email?: string;
  password?: string;
  role?: string;
  class?: string | null;
  major?: string | null;
  faculty?: string | null;
  phone?: string | null;
  address?: string | null;
  isActive?: boolean;
}

/**
 * Update data interface
 */
export interface UpdateUserData {
  fullName?: string;
  email?: string;
  password?: string;
  role?: string;
  class?: string | null;
  major?: string | null;
  faculty?: string | null;
  phone?: string | null;
  address?: string | null;
  isActive?: boolean;
}

/**
 * UpdateUserDto
 * Data Transfer Object for updating a user
 */
class UpdateUserDto {
  fullName: string | null = null;
  email: string | null = null;
  password: string | null = null;
  role: string | null = null;
  class: string | null = null;
  major: string | null = null;
  faculty: string | null = null;
  phone: string | null = null;
  address: string | null = null;
  isActive: boolean | null = null;

  static fromRequest(body: UpdateUserRequestBody): UpdateUserDto {
    const dto = new UpdateUserDto();
    
    if (body.fullName !== undefined) dto.fullName = body.fullName?.trim() ?? null;
    if (body.email !== undefined) dto.email = body.email?.trim().toLowerCase() ?? null;
    if (body.password !== undefined) dto.password = body.password ?? null;
    if (body.role !== undefined) dto.role = body.role ?? null;
    if (body.class !== undefined) dto.class = body.class ?? null;
    if (body.major !== undefined) dto.major = body.major ?? null;
    if (body.faculty !== undefined) dto.faculty = body.faculty ?? null;
    if (body.phone !== undefined) dto.phone = body.phone ?? null;
    if (body.address !== undefined) dto.address = body.address ?? null;
    if (body.isActive !== undefined) dto.isActive = body.isActive ?? null;

    return dto;
  }

  toUpdateData(): UpdateUserData {
    const data: UpdateUserData = {};
    if (this.fullName !== null) data.fullName = this.fullName;
    if (this.email !== null) data.email = this.email;
    if (this.password !== null) data.password = this.password;
    if (this.role !== null) data.role = this.role;
    if (this.class !== null) data.class = this.class;
    if (this.major !== null) data.major = this.major;
    if (this.faculty !== null) data.faculty = this.faculty;
    if (this.phone !== null) data.phone = this.phone;
    if (this.address !== null) data.address = this.address;
    if (this.isActive !== null) data.isActive = this.isActive;
    return data;
  }
}

export default UpdateUserDto;
module.exports = UpdateUserDto;
