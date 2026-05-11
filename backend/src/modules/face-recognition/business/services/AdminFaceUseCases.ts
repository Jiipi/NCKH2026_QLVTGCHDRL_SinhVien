/**
 * AdminFaceUseCases
 * ==================
 * Use cases cho Admin/Giảng viên quản lý dữ liệu khuôn mặt:
 * - Danh sách face data (chờ duyệt / đã duyệt)
 * - Xác minh (verify) face data
 * - Từ chối (reject) face data
 */

import { NotFoundError, ValidationError, ForbiddenError } from '../../../../core/errors/AppError';
import { isTeacherOrAbove } from '../../../../core/utils/roleHelper';
import { auditIntegrityService } from '../../../audit-integrity/services/auditIntegrity.service';
import { prisma } from '../../../../data/infrastructure/prisma/client';
import type { FaceAuditContext } from '../interfaces';

interface AdminFaceListParams {
  status?: 'pending' | 'verified' | 'all';
  classId?: string;
  page?: number;
  limit?: number;
}

interface FaceRegistrationItem {
  id: string;
  sinhVienId: string;
  mssv: string;
  hoTen: string;
  lopTen: string;
  daXacMinh: boolean;
  soAnhDangKy: number;
  anhKhuonMat: string | null;
  modelName: string | null;
  modelVersion: string | null;
  ngayDangKy: Date;
  ngayCapNhat: Date;
}

interface AdminFaceListResult {
  items: FaceRegistrationItem[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

class AdminListFaceRegistrationsUseCase {
  async execute(params: AdminFaceListParams): Promise<AdminFaceListResult> {
    const { status = 'all', classId, page = 1, limit = 20 } = params;

    const where: any = {};
    if (status === 'pending') {
      where.da_xac_minh = false;
    } else if (status === 'verified') {
      where.da_xac_minh = true;
    }
    if (classId) {
      where.sinh_vien = { lop_id: classId };
    }

    const [items, total] = await Promise.all([
      prisma.duLieuKhuonMat.findMany({
        where,
        select: {
          id: true,
          sinh_vien_id: true,
          da_xac_minh: true,
          so_anh_dang_ky: true,
          anh_khuon_mat: true,
          model_name: true,
          model_version: true,
          ngay_tao: true,
          ngay_cap_nhat: true,
          sinh_vien: {
            select: {
              id: true,
              mssv: true,
              lop: { select: { ten_lop: true } },
              nguoi_dung: { select: { ho_ten: true } }
            }
          }
        },
        orderBy: [{ da_xac_minh: 'asc' }, { ngay_tao: 'desc' }],
        skip: (page - 1) * limit,
        take: limit
      }),
      prisma.duLieuKhuonMat.count({ where })
    ]);

    return {
      items: items.map(item => ({
        id: item.id,
        sinhVienId: item.sinh_vien_id,
        mssv: item.sinh_vien.mssv,
        hoTen: item.sinh_vien.nguoi_dung?.ho_ten || '',
        lopTen: item.sinh_vien.lop?.ten_lop || '',
        daXacMinh: item.da_xac_minh,
        soAnhDangKy: item.so_anh_dang_ky,
        anhKhuonMat: item.anh_khuon_mat,
        modelName: item.model_name,
        modelVersion: item.model_version,
        ngayDangKy: item.ngay_tao,
        ngayCapNhat: item.ngay_cap_nhat
      })),
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit)
    };
  }
}

interface AdminVerifyFaceInput extends FaceAuditContext {
  faceDataId: string;
  userRole: string;
}

class AdminVerifyFaceUseCase {
  async execute(input: AdminVerifyFaceInput): Promise<{ success: boolean; message: string }> {
    const { faceDataId, userRole, actorId, requestId, ipAddress, userAgent } = input;

    if (!isTeacherOrAbove(userRole)) {
      throw new ForbiddenError('Bạn không có quyền xác minh dữ liệu khuôn mặt');
    }

    const faceData = await prisma.duLieuKhuonMat.findUnique({
      where: { id: faceDataId },
      select: { id: true, da_xac_minh: true, sinh_vien_id: true }
    });

    if (!faceData) {
      throw new NotFoundError('Không tìm thấy dữ liệu khuôn mặt');
    }

    if (faceData.da_xac_minh) {
      return { success: true, message: 'Dữ liệu đã được xác minh trước đó.' };
    }

    await prisma.$transaction(async (tx) => {
      await tx.duLieuKhuonMat.update({
        where: { id: faceDataId },
        data: { da_xac_minh: true }
      });

      await auditIntegrityService.appendEvent(tx, {
        chainScope: 'face-data',
        entityType: 'du_lieu_khuon_mat',
        entityId: faceDataId,
        action: 'face_data_verified',
        actorId: actorId || null,
        requestId: requestId || null,
        ipAddress: ipAddress || null,
        userAgent: userAgent || null,
        payload: {
          faceDataId,
          sinhVienId: faceData.sinh_vien_id,
          action: 'verified'
        }
      });
    });

    return { success: true, message: 'Đã xác minh dữ liệu khuôn mặt thành công.' };
  }
}

class AdminRejectFaceUseCase {
  async execute(input: AdminVerifyFaceInput & { reason?: string }): Promise<{ success: boolean; message: string }> {
    const { faceDataId, userRole, actorId, requestId, ipAddress, userAgent, reason } = input;

    if (!isTeacherOrAbove(userRole)) {
      throw new ForbiddenError('Bạn không có quyền từ chối dữ liệu khuôn mặt');
    }

    const faceData = await prisma.duLieuKhuonMat.findUnique({
      where: { id: faceDataId },
      select: { id: true, sinh_vien_id: true, vector_dac_trung: true }
    });

    if (!faceData) {
      throw new NotFoundError('Không tìm thấy dữ liệu khuôn mặt');
    }

    await prisma.$transaction(async (tx) => {
      await tx.duLieuKhuonMat.delete({
        where: { id: faceDataId }
      });

      await auditIntegrityService.appendEvent(tx, {
        chainScope: 'face-data',
        entityType: 'du_lieu_khuon_mat',
        entityId: faceDataId,
        action: 'face_data_rejected_deleted',
        actorId: actorId || null,
        requestId: requestId || null,
        ipAddress: ipAddress || null,
        userAgent: userAgent || null,
        payload: {
          faceDataId,
          sinhVienId: faceData.sinh_vien_id,
          action: 'rejected',
          reason: reason || 'Ảnh không hợp lệ'
        }
      });
    });

    return { success: true, message: 'Đã từ chối và xóa dữ liệu khuôn mặt.' };
  }
}

export const adminListFaceRegistrationsUseCase = new AdminListFaceRegistrationsUseCase();
export const adminVerifyFaceUseCase = new AdminVerifyFaceUseCase();
export const adminRejectFaceUseCase = new AdminRejectFaceUseCase();
