/**
 * Face Data Repository
 * =====================
 * Repository cho thao tác với bảng du_lieu_khuon_mat
 */

import { createHash } from 'crypto';
import { Prisma } from '@prisma/client';
import { prisma } from '../../../../data/infrastructure/prisma/client';
import { auditIntegrityService } from '../../../audit-integrity/services/auditIntegrity.service';
import type { IFaceDataRepository, DuLieuKhuonMatData, FaceAuditContext } from '../../business/interfaces';

function hashFaceVector(vector: number[]): string {
  return createHash('sha256').update(JSON.stringify(vector)).digest('hex');
}

function toFaceImageList(value: Prisma.JsonValue | null): string[] | null {
  return Array.isArray(value) ? value.filter((item): item is string => typeof item === 'string') : null;
}

class FaceDataRepository implements IFaceDataRepository {
  async findStudentByUserId(userId: string) {
    const sinhVien = await prisma.sinhVien.findUnique({
      where: { nguoi_dung_id: userId },
      select: {
        id: true,
        mssv: true,
        nguoi_dung: { select: { ho_ten: true } }
      }
    });

    if (!sinhVien) return null;

    return {
      id: sinhVien.id,
      mssv: sinhVien.mssv,
      ho_ten: sinhVien.nguoi_dung?.ho_ten || ''
    };
  }

  async findActivityById(activityId: string) {
    return prisma.hoatDong.findUnique({
      where: { id: activityId },
      select: {
        id: true,
        ten_hd: true,
        ngay_bd: true,
        ngay_kt: true,
        trang_thai: true,
        yeu_cau_gps: true,
        geo_latitude: true,
        geo_longitude: true,
        geo_radius_meters: true,
        cho_phep_fallback: true
      }
    });
  }

  async findRegistrationByStudentAndActivity(sinhVienId: string, activityId: string) {
    return prisma.dangKyHoatDong.findUnique({
      where: {
        sv_id_hd_id: { sv_id: sinhVienId, hd_id: activityId }
      },
      select: { id: true, trang_thai_dk: true }
    });
  }

  async findAttendanceByStudentAndActivity(sinhVienId: string, activityId: string) {
    return prisma.diemDanh.findUnique({
      where: {
        sv_id_hd_id: { sv_id: sinhVienId, hd_id: activityId }
      },
      select: { id: true, tg_diem_danh: true }
    });
  }


  async findBySinhVienId(sinhVienId: string): Promise<DuLieuKhuonMatData | null> {
    const data = await prisma.duLieuKhuonMat.findUnique({
      where: { sinh_vien_id: sinhVienId }
    });

    if (!data) return null;

    return {
      id: data.id,
      sinh_vien_id: data.sinh_vien_id,
      vector_dac_trung: data.vector_dac_trung,
      anh_khuon_mat: data.anh_khuon_mat,
      anh_khuon_mat_ds: toFaceImageList(data.anh_khuon_mat_ds),
      da_xac_minh: data.da_xac_minh,
      so_anh_dang_ky: data.so_anh_dang_ky,
      ngay_tao: data.ngay_tao,
      ngay_cap_nhat: data.ngay_cap_nhat
    };
  }

  async create(data: {
    sinh_vien_id: string;
    vector_dac_trung: number[];
    anh_khuon_mat?: string;
    anh_khuon_mat_ds?: string[];
    so_anh_dang_ky?: number;
  }): Promise<DuLieuKhuonMatData> {
    const created = await prisma.duLieuKhuonMat.create({
      data: {
        sinh_vien_id: data.sinh_vien_id,
        vector_dac_trung: data.vector_dac_trung,
        anh_khuon_mat: data.anh_khuon_mat || null,
        anh_khuon_mat_ds: data.anh_khuon_mat_ds || Prisma.JsonNull,
        so_anh_dang_ky: data.so_anh_dang_ky || 1,
        da_xac_minh: false
      }
    });

    return {
      id: created.id,
      sinh_vien_id: created.sinh_vien_id,
      vector_dac_trung: created.vector_dac_trung,
      anh_khuon_mat: created.anh_khuon_mat,
      anh_khuon_mat_ds: toFaceImageList(created.anh_khuon_mat_ds),
      da_xac_minh: created.da_xac_minh,
      so_anh_dang_ky: created.so_anh_dang_ky,
      ngay_tao: created.ngay_tao,
      ngay_cap_nhat: created.ngay_cap_nhat
    };
  }

  async update(id: string, data: {
    vector_dac_trung?: number[];
    anh_khuon_mat?: string;
    anh_khuon_mat_ds?: string[];
    da_xac_minh?: boolean;
    so_anh_dang_ky?: number;
  }): Promise<DuLieuKhuonMatData> {
    const updated = await prisma.duLieuKhuonMat.update({
      where: { id },
      data: {
        ...(data.vector_dac_trung && { vector_dac_trung: data.vector_dac_trung }),
        ...(data.anh_khuon_mat !== undefined && { anh_khuon_mat: data.anh_khuon_mat }),
        ...(data.anh_khuon_mat_ds !== undefined && { anh_khuon_mat_ds: data.anh_khuon_mat_ds }),
        ...(data.da_xac_minh !== undefined && { da_xac_minh: data.da_xac_minh }),
        ...(data.so_anh_dang_ky !== undefined && { so_anh_dang_ky: data.so_anh_dang_ky })
      }
    });

    return {
      id: updated.id,
      sinh_vien_id: updated.sinh_vien_id,
      vector_dac_trung: updated.vector_dac_trung,
      anh_khuon_mat: updated.anh_khuon_mat,
      anh_khuon_mat_ds: toFaceImageList(updated.anh_khuon_mat_ds),
      da_xac_minh: updated.da_xac_minh,
      so_anh_dang_ky: updated.so_anh_dang_ky,
      ngay_tao: updated.ngay_tao,
      ngay_cap_nhat: updated.ngay_cap_nhat
    };
  }

  async upsertBySinhVienId(sinhVienId: string, data: {
    vector_dac_trung: number[];
    anh_khuon_mat?: string | null;
    anh_khuon_mat_ds?: string[] | null;
    so_anh_dang_ky?: number;
    model_name?: string;
    model_version?: string;
    audit?: FaceAuditContext;
  }): Promise<{ data: DuLieuKhuonMatData; isUpdate: boolean }> {
    return prisma.$transaction(async (tx) => {
      // Atomic upsert - tránh race condition giữa check + update
      const existing = await tx.duLieuKhuonMat.findUnique({
        where: { sinh_vien_id: sinhVienId },
        select: { id: true }
      });

      const result = await tx.duLieuKhuonMat.upsert({
        where: { sinh_vien_id: sinhVienId },
        create: {
          sinh_vien_id: sinhVienId,
          vector_dac_trung: data.vector_dac_trung,
          anh_khuon_mat: data.anh_khuon_mat ?? null,
          anh_khuon_mat_ds: data.anh_khuon_mat_ds || Prisma.JsonNull,
          so_anh_dang_ky: data.so_anh_dang_ky || 1,
          da_xac_minh: false,
          model_name: data.model_name || null,
          model_version: data.model_version || null
        },
        update: {
          vector_dac_trung: data.vector_dac_trung,
          ...(data.anh_khuon_mat !== undefined ? { anh_khuon_mat: data.anh_khuon_mat } : {}),
          ...(data.anh_khuon_mat_ds !== undefined ? { anh_khuon_mat_ds: data.anh_khuon_mat_ds } : {}),
          so_anh_dang_ky: data.so_anh_dang_ky || 1,
          model_name: data.model_name || undefined,
          model_version: data.model_version || undefined
        }
      });

      await auditIntegrityService.appendEvent(tx, {
        chainScope: 'face-data',
        entityType: 'du_lieu_khuon_mat',
        entityId: result.id,
        action: existing ? 'face_data_updated' : 'face_data_registered',
        actorId: data.audit?.actorId || null,
        requestId: data.audit?.requestId || null,
        ipAddress: data.audit?.ipAddress || null,
        userAgent: data.audit?.userAgent || null,
        payload: {
          faceDataId: result.id,
          sinhVienId: result.sinh_vien_id,
          daXacMinh: result.da_xac_minh,
          soAnhDangKy: result.so_anh_dang_ky,
          vectorHash: hashFaceVector(result.vector_dac_trung),
          isUpdate: !!existing
        }
      });

      return {
        data: {
          id: result.id,
          sinh_vien_id: result.sinh_vien_id,
          vector_dac_trung: result.vector_dac_trung,
          anh_khuon_mat: result.anh_khuon_mat,
          anh_khuon_mat_ds: toFaceImageList(result.anh_khuon_mat_ds),
          da_xac_minh: result.da_xac_minh,
          so_anh_dang_ky: result.so_anh_dang_ky,
          ngay_tao: result.ngay_tao,
          ngay_cap_nhat: result.ngay_cap_nhat
        },
        isUpdate: !!existing
      };
    });
  }

  async delete(id: string, audit?: FaceAuditContext): Promise<void> {
    await prisma.$transaction(async (tx) => {
      const deleted = await tx.duLieuKhuonMat.delete({
        where: { id }
      });

      await auditIntegrityService.appendEvent(tx, {
        chainScope: 'face-data',
        entityType: 'du_lieu_khuon_mat',
        entityId: deleted.id,
        action: 'face_data_deleted',
        actorId: audit?.actorId || null,
        requestId: audit?.requestId || null,
        ipAddress: audit?.ipAddress || null,
        userAgent: audit?.userAgent || null,
        payload: {
          faceDataId: deleted.id,
          sinhVienId: deleted.sinh_vien_id,
          daXacMinh: deleted.da_xac_minh,
          soAnhDangKy: deleted.so_anh_dang_ky,
          vectorHash: hashFaceVector(deleted.vector_dac_trung)
        }
      });
    });
  }

  async createFaceAttendance(data: {
    nguoi_diem_danh_id: string;
    sv_id: string;
    hd_id: string;
    do_tin_cay_nhan_dien: number;
    ghi_chu: string;
    vi_tri_gps?: string | null;
    gps_latitude?: number | null;
    gps_longitude?: number | null;
    gps_accuracy_m?: number | null;
    khoang_cach_m?: number | null;
    ket_qua_geofence?: string | null;
    audit?: FaceAuditContext;
  }) {
    return prisma.$transaction(async (tx) => {
      const attendance = await tx.diemDanh.create({
        data: {
          nguoi_diem_danh_id: data.nguoi_diem_danh_id,
          sv_id: data.sv_id,
          hd_id: data.hd_id,
          phuong_thuc: 'khuon_mat',
          trang_thai_tham_gia: 'co_mat',
          xac_nhan_tham_gia: true,
          do_tin_cay_nhan_dien: data.do_tin_cay_nhan_dien,
          ghi_chu: data.ghi_chu,
          vi_tri_gps: data.vi_tri_gps || null,
          gps_latitude: data.gps_latitude ?? null,
          gps_longitude: data.gps_longitude ?? null,
          gps_accuracy_m: data.gps_accuracy_m ?? null,
          khoang_cach_m: data.khoang_cach_m ?? null,
          ket_qua_geofence: (data.ket_qua_geofence as any) || null
        },
        select: {
          id: true,
          tg_diem_danh: true,
          nguoi_diem_danh_id: true,
          sv_id: true,
          hd_id: true,
          phuong_thuc: true,
          trang_thai_tham_gia: true,
          xac_nhan_tham_gia: true,
          do_tin_cay_nhan_dien: true,
          ghi_chu: true
        }
      });

      await auditIntegrityService.appendEvent(tx, {
        chainScope: 'attendance',
        entityType: 'diem_danh',
        entityId: attendance.id,
        action: 'attendance_created_face',
        actorId: data.audit?.actorId || data.nguoi_diem_danh_id,
        requestId: data.audit?.requestId || null,
        ipAddress: data.audit?.ipAddress || null,
        userAgent: data.audit?.userAgent || null,
        payload: {
          attendanceId: attendance.id,
          nguoiDiemDanhId: attendance.nguoi_diem_danh_id,
          sinhVienId: attendance.sv_id,
          hoatDongId: attendance.hd_id,
          thoiGianDiemDanh: attendance.tg_diem_danh,
          phuongThuc: attendance.phuong_thuc,
          trangThaiThamGia: attendance.trang_thai_tham_gia,
          xacNhanThamGia: attendance.xac_nhan_tham_gia,
          doTinCayNhanDien: attendance.do_tin_cay_nhan_dien,
          ghiChu: attendance.ghi_chu
        }
      });

      return {
        id: attendance.id,
        tg_diem_danh: attendance.tg_diem_danh
      };
    });
  }

  async createFaceAttendanceAndMarkRegistration(data: {
    registrationId: string;
    nguoi_diem_danh_id: string;
    sv_id: string;
    hd_id: string;
    do_tin_cay_nhan_dien: number;
    ghi_chu: string;
    audit?: FaceAuditContext;
  }) {
    return prisma.$transaction(async (tx) => {
      const attendance = await tx.diemDanh.create({
        data: {
          nguoi_diem_danh_id: data.nguoi_diem_danh_id,
          sv_id: data.sv_id,
          hd_id: data.hd_id,
          phuong_thuc: 'khuon_mat',
          trang_thai_tham_gia: 'co_mat',
          xac_nhan_tham_gia: true,
          do_tin_cay_nhan_dien: data.do_tin_cay_nhan_dien,
          ghi_chu: data.ghi_chu
        },
        select: {
          id: true,
          tg_diem_danh: true,
          nguoi_diem_danh_id: true,
          sv_id: true,
          hd_id: true,
          phuong_thuc: true,
          trang_thai_tham_gia: true,
          xac_nhan_tham_gia: true,
          do_tin_cay_nhan_dien: true,
          ghi_chu: true
        }
      });

      const registration = await tx.dangKyHoatDong.update({
        where: { id: data.registrationId },
        data: { trang_thai_dk: 'da_tham_gia' }
      });

      await auditIntegrityService.appendEvent(tx, {
        chainScope: 'attendance',
        entityType: 'diem_danh',
        entityId: attendance.id,
        action: 'attendance_created_monitor_face',
        actorId: data.audit?.actorId || data.nguoi_diem_danh_id,
        requestId: data.audit?.requestId || null,
        ipAddress: data.audit?.ipAddress || null,
        userAgent: data.audit?.userAgent || null,
        payload: {
          attendanceId: attendance.id,
          nguoiDiemDanhId: attendance.nguoi_diem_danh_id,
          sinhVienId: attendance.sv_id,
          hoatDongId: attendance.hd_id,
          thoiGianDiemDanh: attendance.tg_diem_danh,
          phuongThuc: attendance.phuong_thuc,
          trangThaiThamGia: attendance.trang_thai_tham_gia,
          xacNhanThamGia: attendance.xac_nhan_tham_gia,
          doTinCayNhanDien: attendance.do_tin_cay_nhan_dien,
          ghiChu: attendance.ghi_chu
        }
      });

      await auditIntegrityService.appendEvent(tx, {
        chainScope: 'registration',
        entityType: 'dang_ky_hoat_dong',
        entityId: registration.id,
        action: 'registration_marked_attended_monitor_face',
        actorId: data.audit?.actorId || null,
        requestId: data.audit?.requestId || null,
        ipAddress: data.audit?.ipAddress || null,
        userAgent: data.audit?.userAgent || null,
        payload: {
          registrationId: registration.id,
          sinhVienId: registration.sv_id,
          hoatDongId: registration.hd_id,
          trangThaiDk: registration.trang_thai_dk,
          attendanceId: attendance.id
        }
      });

      return {
        id: attendance.id,
        tg_diem_danh: attendance.tg_diem_danh
      };
    });
  }

  async markRegistrationAsAttended(registrationId: string, audit?: FaceAuditContext & { attendanceId?: string | null; svId?: string; activityId?: string }): Promise<void> {
    await prisma.$transaction(async (tx) => {
      const updated = await tx.dangKyHoatDong.update({
        where: { id: registrationId },
        data: { trang_thai_dk: 'da_tham_gia' }
      });

      await auditIntegrityService.appendEvent(tx, {
        chainScope: 'registration',
        entityType: 'dang_ky_hoat_dong',
        entityId: updated.id,
        action: 'registration_marked_attended_face',
        actorId: audit?.actorId || null,
        requestId: audit?.requestId || null,
        ipAddress: audit?.ipAddress || null,
        userAgent: audit?.userAgent || null,
        payload: {
          registrationId: updated.id,
          sinhVienId: updated.sv_id,
          hoatDongId: updated.hd_id,
          trangThaiDk: updated.trang_thai_dk,
          attendanceId: audit?.attendanceId || null
        }
      });
    });
  }

  async existsBySinhVienId(sinhVienId: string): Promise<boolean> {
    const count = await prisma.duLieuKhuonMat.count({
      where: { sinh_vien_id: sinhVienId }
    });
    return count > 0;
  }

  async findFaceDataByClassId(classId: string) {
    const faceData = await prisma.duLieuKhuonMat.findMany({
      where: {
        sinh_vien: { lop_id: classId },
        da_xac_minh: true  // Chỉ lấy face data đã được xác minh
      },
      select: {
        id: true,
        sinh_vien_id: true,
        vector_dac_trung: true,
        sinh_vien: {
          select: {
            id: true,
            mssv: true,
            lop_id: true,
            nguoi_dung: { select: { ho_ten: true } }
          }
        }
      }
    });

    return faceData.map(data => ({
      id: data.id,
      sinh_vien_id: data.sinh_vien_id,
      vector_dac_trung: data.vector_dac_trung,
      sinh_vien: {
        id: data.sinh_vien.id,
        mssv: data.sinh_vien.mssv,
        lop_id: data.sinh_vien.lop_id,
        ho_ten: data.sinh_vien.nguoi_dung?.ho_ten || ''
      }
    }));
  }

  async findAllFaceData(): Promise<Array<{ id: string; sinh_vien_id: string; vector_dac_trung: number[] }>> {
    return prisma.duLieuKhuonMat.findMany({
      select: {
        id: true,
        sinh_vien_id: true,
        vector_dac_trung: true
      }
    });
  }
}

export const faceDataRepository = new FaceDataRepository();
export default FaceDataRepository;
