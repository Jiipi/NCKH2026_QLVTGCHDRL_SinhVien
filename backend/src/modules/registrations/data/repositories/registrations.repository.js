/**
 * Registrations Repository - Pure Data Access Layer
 * Chỉ chứa Prisma queries, không có business logic
 */

const { prisma } = require('../../../../data/infrastructure/prisma/client');

class RegistrationsRepository {
  /**
   * Lấy danh sách registrations với filter và pagination
   */
  async findMany({ where = {}, skip = 0, limit = 20, orderBy = { ngay_dang_ky: 'desc' }, include = {} }) {
    const hasLimit = typeof limit === 'number' && Number.isFinite(limit) && limit > 0;
    // Map generic filters to legacy schema
    const mappedWhere = { ...where };
    if (mappedWhere.status) {
      const statusMap = {
        PENDING: 'cho_duyet',
        APPROVED: 'da_duyet',
        REJECTED: 'tu_choi',
        ATTENDED: 'da_tham_gia'
      };
      mappedWhere.trang_thai_dk = statusMap[mappedWhere.status] || mappedWhere.status;
      delete mappedWhere.status;
    }

    // Build include for legacy relations
    const prismaInclude = {};
    if (include.activity) {
      prismaInclude.hoat_dong = true;
    }
    if (include.user) {
      prismaInclude.sinh_vien = { include: { nguoi_dung: true, lop: true } };
    }

    const queryOptions = {
      where: mappedWhere,
      orderBy,
      include: prismaInclude
    };

    if (hasLimit) {
      queryOptions.skip = skip;
      queryOptions.take = limit;
    }

    const [rawItems, total] = await Promise.all([
      prisma.dangKyHoatDong.findMany(queryOptions),
      prisma.dangKyHoatDong.count({ where: mappedWhere })
    ]);

    // Normalize to unified shape when include requested
    const items = rawItems.map(item => {
      const normalized = { ...item };
      // Add unified status for callers expecting EN locale
      if (normalized.trang_thai_dk) {
        const reverseStatusMap = {
          'cho_duyet': 'PENDING',
          'da_duyet': 'APPROVED',
          'tu_choi': 'REJECTED',
          'da_tham_gia': 'ATTENDED'
        };
        normalized.status = reverseStatusMap[normalized.trang_thai_dk] || normalized.trang_thai_dk;
      }
      // Map legacy relations
      if (normalized.hoat_dong) {
        normalized.activity = normalized.hoat_dong;
        normalized.activityId = normalized.hd_id;
        delete normalized.hoat_dong;
        delete normalized.hd_id;
      }
      if (normalized.sinh_vien) {
        normalized.user = normalized.sinh_vien.nguoi_dung;
        normalized.userId = normalized.sv_id;
        normalized.student = normalized.sinh_vien;
        delete normalized.sinh_vien;
        delete normalized.sv_id;
      }
      return normalized;
    });

    return { items, total };
  }

  async findById(id, include = {}) {
    const prismaInclude = {};
    if (include.activity) {
      prismaInclude.hoat_dong = true;
    }
    if (include.user) {
      prismaInclude.sinh_vien = { include: { nguoi_dung: true, lop: true } };
    }

    // id là UUID (String), không parse
    const item = await prisma.dangKyHoatDong.findUnique({
      where: { id: String(id) }, // UUID - giữ nguyên string
      include: prismaInclude
    });

    if (!item) return null;

    // Normalize
    const normalized = { ...item };
    if (normalized.trang_thai_dk) {
      const reverseStatusMap = {
        'cho_duyet': 'PENDING',
        'da_duyet': 'APPROVED',
        'tu_choi': 'REJECTED',
        'da_tham_gia': 'ATTENDED'
      };
      normalized.status = reverseStatusMap[normalized.trang_thai_dk] || normalized.trang_thai_dk;
    }
    if (normalized.hoat_dong) {
      normalized.activity = normalized.hoat_dong;
      normalized.activityId = normalized.hd_id;
      delete normalized.hoat_dong;
      delete normalized.hd_id;
    }
    if (normalized.sinh_vien) {
      normalized.user = normalized.sinh_vien.nguoi_dung;
      normalized.userId = normalized.sv_id;
      normalized.student = normalized.sinh_vien;
      delete normalized.sinh_vien;
      delete normalized.sv_id;
    }

    return normalized;
  }

  async findByUserAndActivity(userId, activityId) {
    // sv_id và hd_id là UUID (String), không parse
    const item = await prisma.dangKyHoatDong.findFirst({
      where: {
        sv_id: String(userId), // UUID - giữ nguyên string
        hd_id: String(activityId) // UUID - giữ nguyên string
      }
    });
    return item || null;
  }

  async create(data) {
    // sv_id và hd_id là UUID (String), không parse
    // Map status nếu có
    let trangThaiDk = data.trang_thai_dk;
    if (data.status && !trangThaiDk) {
      const statusMap = {
        'PENDING': 'cho_duyet',
        'APPROVED': 'da_duyet',
        'REJECTED': 'tu_choi',
        'ATTENDED': 'da_tham_gia'
      };
      trangThaiDk = statusMap[data.status] || 'cho_duyet';
    }
    
    // Validate required fields
    const svId = String(data.userId || data.sv_id);
    const hdId = String(data.activityId || data.hd_id);
    
    if (!svId || svId === 'undefined' || svId === 'null') {
      const { ValidationError } = require('../../../../core/errors/AppError');
      throw new ValidationError('sv_id (userId) is required and must be a valid UUID');
    }
    if (!hdId || hdId === 'undefined' || hdId === 'null') {
      const { ValidationError } = require('../../../../core/errors/AppError');
      throw new ValidationError('hd_id (activityId) is required and must be a valid UUID');
    }
    
    console.log('[RegistrationsRepository] Creating registration:', {
      sv_id: svId,
      hd_id: hdId,
      trang_thai_dk: trangThaiDk || 'cho_duyet'
    });
    
    const created = await prisma.dangKyHoatDong.create({
      data: {
        sv_id: svId, // UUID - giữ nguyên string
        hd_id: hdId, // UUID - giữ nguyên string
        trang_thai_dk: trangThaiDk || 'cho_duyet',
        ngay_dang_ky: data.ngay_dang_ky || new Date(),
        ...(data.note && { ly_do_dk: data.note }), // note -> ly_do_dk
        ...(data.ly_do && { ly_do_dk: data.ly_do }), // ly_do -> ly_do_dk
        ...(data.ghi_chu && { ghi_chu: data.ghi_chu })
      },
      include: {
        hoat_dong: true,
        sinh_vien: { include: { nguoi_dung: true, lop: true } }
      }
    });

    // Normalize
    const normalized = { ...created };
    if (normalized.hoat_dong) {
      normalized.activity = normalized.hoat_dong;
      normalized.activityId = normalized.hd_id;
      delete normalized.hoat_dong;
      delete normalized.hd_id;
    }
    if (normalized.sinh_vien) {
      normalized.user = normalized.sinh_vien.nguoi_dung;
      normalized.userId = normalized.sv_id;
      normalized.student = normalized.sinh_vien;
      delete normalized.sinh_vien;
      delete normalized.sv_id;
    }

    return normalized;
  }

  async update(id, data) {
    const updateData = {};
    if (data.status !== undefined) {
      updateData.trang_thai_dk = data.status;
    }
    if (data.trang_thai_dk !== undefined) {
      updateData.trang_thai_dk = data.trang_thai_dk;
    }
    if (data.ly_do !== undefined) {
      updateData.ly_do_tu_choi = data.ly_do;
    }
    if (data.ly_do_tu_choi !== undefined) {
      updateData.ly_do_tu_choi = data.ly_do_tu_choi;
    }
    if (data.ngay_duyet !== undefined) {
      updateData.ngay_duyet = data.ngay_duyet;
    }
    if (data.ngay_tham_gia !== undefined) {
      updateData.ngay_tham_gia = data.ngay_tham_gia;
    }

    // id là UUID (String), không parse
    const updated = await prisma.dangKyHoatDong.update({
      where: { id: String(id) }, // UUID - giữ nguyên string
      data: updateData,
      include: {
        hoat_dong: true,
        sinh_vien: { include: { nguoi_dung: true, lop: true } }
      }
    });

    // Normalize
    const normalized = { ...updated };
    if (normalized.hoat_dong) {
      normalized.activity = normalized.hoat_dong;
      normalized.activityId = normalized.hd_id;
      delete normalized.hoat_dong;
      delete normalized.hd_id;
    }
    if (normalized.sinh_vien) {
      normalized.user = normalized.sinh_vien.nguoi_dung;
      normalized.userId = normalized.sv_id;
      normalized.student = normalized.sinh_vien;
      delete normalized.sinh_vien;
      delete normalized.sv_id;
    }

    return normalized;
  }

  async delete(id) {
    // id là UUID (String), không parse
    return prisma.dangKyHoatDong.delete({
      where: { id: String(id) } // UUID - giữ nguyên string
    });
  }

  async bulkApprove(ids, approverId) {
    // id là UUID (String), không parse
    return prisma.dangKyHoatDong.updateMany({
      where: {
        id: { in: ids.map(id => String(id)) } // UUID - giữ nguyên string
      },
      data: {
        trang_thai_dk: 'da_duyet',
        ngay_duyet: new Date(),
        nguoi_duyet_id: approverId || null
      }
    });
  }

  async bulkReject(ids, reason, approverId) {
    // id là UUID (String), không parse
    return prisma.dangKyHoatDong.updateMany({
      where: {
        id: { in: ids.map(id => String(id)) } // UUID - giữ nguyên string
      },
      data: {
        trang_thai_dk: 'tu_choi',
        ngay_duyet: new Date(),
        nguoi_duyet_id: approverId || null,
        ...(reason && { ly_do_tu_choi: reason })
      }
    });
  }

  async checkIn(id, checkInTime) {
    // id là UUID (String), không parse
    return prisma.dangKyHoatDong.update({
      where: { id: String(id) }, // UUID - giữ nguyên string
      data: {
        trang_thai_dk: 'da_tham_gia',
        ngay_tham_gia: checkInTime || new Date()
      },
      include: {
        hoat_dong: true,
        sinh_vien: { include: { nguoi_dung: true, lop: true } }
      }
    });
  }

  async findByUser(userId, filters = {}) {
    // sv_id là UUID (String), không parse
    const where = {
      sv_id: String(userId) // UUID - giữ nguyên string
    };

    if (filters.status) {
      const statusMap = {
        PENDING: 'cho_duyet',
        APPROVED: 'da_duyet',
        REJECTED: 'tu_choi',
        ATTENDED: 'da_tham_gia'
      };
      where.trang_thai_dk = statusMap[filters.status] || filters.status;
    }

    return prisma.dangKyHoatDong.findMany({
      where,
      include: {
        hoat_dong: true
      },
      orderBy: { ngay_dang_ky: 'desc' }
    });
  }

  async getActivityStats(activityId) {
    // hd_id là UUID (String), không parse
    const stats = await prisma.dangKyHoatDong.groupBy({
      by: ['trang_thai_dk'],
      where: {
        hd_id: String(activityId) // UUID - giữ nguyên string
      },
      _count: {
        id: true
      }
    });

    const result = {
      total: 0,
      pending: 0,
      approved: 0,
      rejected: 0,
      attended: 0
    };

    stats.forEach(stat => {
      result.total += stat._count.id;
      switch (stat.trang_thai_dk) {
        case 'cho_duyet':
          result.pending = stat._count.id;
          break;
        case 'da_duyet':
          result.approved = stat._count.id;
          break;
        case 'tu_choi':
          result.rejected = stat._count.id;
          break;
        case 'da_tham_gia':
          result.attended = stat._count.id;
          break;
      }
    });

    return result;
  }
}

module.exports = new RegistrationsRepository();

