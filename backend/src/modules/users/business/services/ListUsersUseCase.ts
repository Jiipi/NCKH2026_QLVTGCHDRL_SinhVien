import type { NguoiDung } from '@prisma/client';
import type IUserRepository from '../interfaces/IUserRepository';
import ListUsersDto from '../dto/ListUsersDto';
import { buildScope } from '../../../../app/scopes/scopeBuilder';

interface AuthUser {
  id: string | number;
  role: string;
}

interface Pagination {
  page: number;
  limit: number;
}

interface ListUsersDtoType {
  toFilters(): Record<string, unknown>;
  toPagination(): Pagination;
}

interface TransformedUser {
  id: string | number;
  mssv: string | null;
  fullName: string;
  email: string;
  role: string | null;
  class: string | null;
  faculty: string | null;
  phone: string | null;
  isActive: boolean;
  createdAt: Date;
}

interface ListUsersResult {
  items: TransformedUser[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

interface FindManyResult {
  items: Array<NguoiDung & {
    vai_tro?: { ten_vt?: string };
    sinh_vien?: {
      mssv?: string;
      sdt?: string;
      lop?: { ten_lop?: string; khoa?: string };
    };
  }>;
  total: number;
}

/**
 * ListUsersUseCase
 * Use case for listing users with filters and pagination
 * Follows Single Responsibility Principle (SRP)
 */
class ListUsersUseCase {
  private userRepository: IUserRepository;

  constructor(userRepository: IUserRepository) {
    this.userRepository = userRepository;
  }

  async execute(dto: ListUsersDtoType, user: AuthUser): Promise<ListUsersResult> {
    const scope = await buildScope('users', user);
    const filters = dto.toFilters();
    const pagination = dto.toPagination();

    // Map incoming filters to actual Prisma schema fields
    const mappedFilters: Record<string, unknown> = { ...filters };
    let requestedRawRole: string | null = null;
    
    if (mappedFilters.vai_tro && (mappedFilters.vai_tro as Record<string, unknown>).ten_vt) {
      requestedRawRole = (mappedFilters.vai_tro as Record<string, string>).ten_vt;
      mappedFilters.vai_tro = {
        ten_vt: { equals: requestedRawRole, mode: 'insensitive' }
      };
    }

    mappedFilters.trang_thai = 'hoat_dong';

    if (mappedFilters.fullName) {
      mappedFilters.ho_ten = mappedFilters.fullName;
      delete mappedFilters.fullName;
    }

    let where: Record<string, unknown> = { ...scope, ...mappedFilters };

    // Expand teacher role synonyms if GIANG_VIEN requested
    const teacherRequested = requestedRawRole && requestedRawRole.toUpperCase().includes('GIANG_VIEN');
    if (teacherRequested) {
      where = {
        ...Object.fromEntries(Object.entries(where).filter(([k]) => k !== 'vai_tro')),
        OR: [
          { vai_tro: { ten_vt: { equals: 'GIANG_VIEN', mode: 'insensitive' } } },
          { vai_tro: { ten_vt: { equals: 'GIANG VIEN', mode: 'insensitive' } } },
          { vai_tro: { ten_vt: { equals: 'Giảng viên', mode: 'insensitive' } } },
          { vai_tro: { ten_vt: { equals: 'GIẢNG_VIÊN', mode: 'insensitive' } } },
          { vai_tro: { ten_vt: { equals: 'GV', mode: 'insensitive' } } }
        ],
        trang_thai: 'hoat_dong'
      };
    }

    const page = pagination.page;
    const limit = pagination.limit;
    const skip = (page - 1) * limit;

    let result: FindManyResult = await this.userRepository.findMany({ where, skip, limit, select: {} }) as unknown as FindManyResult;

    // Fallback logic for teacher role
    if (teacherRequested && result.items.length === 0) {
      const roleVariants = ['GIANG_VIEN','GIANG VIEN','Giảng viên','GIẢNG_VIÊN','GV'];
      const variantResult = await this.userRepository.findByRoleNames(roleVariants);
      if (variantResult.length > 0) {
        result = { items: variantResult as FindManyResult['items'], total: variantResult.length };
      } else {
        const teacherUsers = await this.userRepository.findByTeacherClassAssignments();
        result = { items: teacherUsers as FindManyResult['items'], total: teacherUsers.length };
      }
    }

    // Transform to legacy frontend shape
    const transformed: TransformedUser[] = result.items.map(u => ({
      id: u.id,
      mssv: u.sinh_vien?.mssv || null,
      fullName: u.ho_ten || u.ten_dn,
      email: u.email,
      role: u.vai_tro?.ten_vt || (teacherRequested ? 'GIANG_VIEN' : null),
      class: u.sinh_vien?.lop?.ten_lop || null,
      faculty: u.sinh_vien?.lop?.khoa || null,
      phone: u.sinh_vien?.sdt || null,
      isActive: u.trang_thai === 'hoat_dong',
      createdAt: u.ngay_tao
    }));

    return {
      items: transformed,
      total: result.total,
      page,
      limit,
      totalPages: Math.ceil(result.total / limit)
    };
  }
}

export default ListUsersUseCase;
module.exports = ListUsersUseCase;
