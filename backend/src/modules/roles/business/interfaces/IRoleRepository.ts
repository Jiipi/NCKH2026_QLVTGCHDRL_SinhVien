import type { VaiTro, NguoiDung, SinhVien, HoatDong } from '@prisma/client';
import type { Prisma } from '@prisma/client';

/**
 * IRoleRepository
 * Interface for role data access
 * Follows Dependency Inversion Principle (DIP)
 */

export interface RoleFilters {
  search?: string;
}

export interface Pagination {
  page?: number | string;
  limit?: number | string;
}

export interface FindManyResult {
  items: VaiTro[];
  total: number;
}

export interface RoleCreateData {
  ten_vt: string;
  mo_ta?: string | null;
  quyen_han?: Prisma.JsonValue | null;
}

export interface RoleUpdateData {
  ten_vt?: string;
  mo_ta?: string | null;
  quyen_han?: Prisma.JsonValue | null;
}

export interface UserIdOnly {
  id: string;
}

export interface StudentIdOnly {
  id: string;
}

export interface ActivityIdOnly {
  id: string;
}

export interface BatchUpdateResult {
  count: number;
}

abstract class IRoleRepository {
  async findMany(_filters: RoleFilters, _pagination: Pagination): Promise<FindManyResult> {
    throw new Error('Method not implemented');
  }

  async findById(_id: string): Promise<VaiTro | null> {
    throw new Error('Method not implemented');
  }

  async findByName(_name: string): Promise<VaiTro | null> {
    throw new Error('Method not implemented');
  }

  async create(_data: RoleCreateData): Promise<VaiTro> {
    throw new Error('Method not implemented');
  }

  async update(_id: string, _data: RoleUpdateData): Promise<VaiTro> {
    throw new Error('Method not implemented');
  }

  async delete(_id: string): Promise<VaiTro> {
    throw new Error('Method not implemented');
  }

  async countUsersWithRole(_roleId: string): Promise<number> {
    throw new Error('Method not implemented');
  }

  async findUsersWithRole(_roleId: string): Promise<UserIdOnly[]> {
    throw new Error('Method not implemented');
  }

  async reassignUsers(_oldRoleId: string, _newRoleId: string): Promise<BatchUpdateResult> {
    throw new Error('Method not implemented');
  }

  async assignRoleToUsers(_roleId: string, _userIds: string[]): Promise<BatchUpdateResult> {
    throw new Error('Method not implemented');
  }

  async countClassesWithHomeroom(_userIds: string[]): Promise<number> {
    throw new Error('Method not implemented');
  }

  async findStudentsByUserIds(_userIds: string[]): Promise<StudentIdOnly[]> {
    throw new Error('Method not implemented');
  }

  async findActivitiesByCreators(_userIds: string[]): Promise<ActivityIdOnly[]> {
    throw new Error('Method not implemented');
  }

  async cascadeDeleteUsers(_userIds: string[], _studentIds: string[], _activityIds: string[]): Promise<void> {
    throw new Error('Method not implemented');
  }
}

export default IRoleRepository;
module.exports = IRoleRepository;
