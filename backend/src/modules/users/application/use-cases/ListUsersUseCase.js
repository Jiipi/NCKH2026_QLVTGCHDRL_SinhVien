const ListUsersDto = require('../dto/ListUsersDto');
const { buildScope } = require('../../../../app/scopes/scopeBuilder');
const { prisma } = require('../../../../infrastructure/prisma/client');

/**
 * ListUsersUseCase
 * Use case for listing users with filters and pagination
 * Follows Single Responsibility Principle (SRP)
 */
class ListUsersUseCase {
  constructor(userRepository) {
    this.userRepository = userRepository;
  }

  async execute(dto, user) {
    const scope = await buildScope('users', user);
    const filters = dto.toFilters();
    const pagination = dto.toPagination();

    // Map incoming filters to actual Prisma schema fields
    const mappedFilters = { ...filters };
    let requestedRawRole = null;
    
    if (mappedFilters.vai_tro && mappedFilters.vai_tro.ten_vt) {
      requestedRawRole = mappedFilters.vai_tro.ten_vt;
      mappedFilters.vai_tro = {
        ten_vt: { equals: requestedRawRole, mode: 'insensitive' }
      };
    }

    mappedFilters.trang_thai = 'hoat_dong';

    if (mappedFilters.fullName) {
      mappedFilters.ho_ten = mappedFilters.fullName;
      delete mappedFilters.fullName;
    }

    let where = { ...scope, ...mappedFilters };

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

    let result = await this.userRepository.findMany({ where, skip, limit, select: {} });

    // Fallback logic for teacher role
    if (teacherRequested && result.items.length === 0) {
      const roleVariants = ['GIANG_VIEN','GIANG VIEN','Giảng viên','GIẢNG_VIÊN','GV'];
      const variantResult = await prisma.nguoiDung.findMany({
        where: {
          trang_thai: 'hoat_dong',
          vai_tro: { ten_vt: { in: roleVariants, mode: 'insensitive' } }
        },
        include: {
          vai_tro: true,
          sinh_vien: { include: { lop: true } }
        }
      });
      if (variantResult.length > 0) {
        result = { items: variantResult, total: variantResult.length };
      } else {
        const classRows = await prisma.lop.findMany({
          select: { id: true, ten_lop: true, chu_nhiem: true }
        });
        const teacherIds = [...new Set(classRows.map(c => c.chu_nhiem).filter(Boolean))];
        if (teacherIds.length) {
          const teacherUsers = await prisma.nguoiDung.findMany({
            where: { id: { in: teacherIds } },
            include: {
              vai_tro: true,
              sinh_vien: { include: { lop: true } }
            }
          });
          result = { items: teacherUsers, total: teacherUsers.length };
        }
      }
    }

    // Transform to legacy frontend shape
    const transformed = result.items.map(u => ({
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

module.exports = ListUsersUseCase;

