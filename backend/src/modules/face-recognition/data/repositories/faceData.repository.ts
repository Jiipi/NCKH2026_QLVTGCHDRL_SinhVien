/**
 * Face Data Repository
 * =====================
 * Repository cho thao tác với bảng du_lieu_khuon_mat
 */

import { prisma } from '../../../../data/infrastructure/prisma/client';
import type { IFaceDataRepository, DuLieuKhuonMatData } from '../../business/interfaces';

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
        trang_thai: true
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
    so_anh_dang_ky?: number;
  }): Promise<DuLieuKhuonMatData> {
    const created = await prisma.duLieuKhuonMat.create({
      data: {
        sinh_vien_id: data.sinh_vien_id,
        vector_dac_trung: data.vector_dac_trung,
        anh_khuon_mat: data.anh_khuon_mat || null,
        so_anh_dang_ky: data.so_anh_dang_ky || 1,
        da_xac_minh: false
      }
    });

    return {
      id: created.id,
      sinh_vien_id: created.sinh_vien_id,
      vector_dac_trung: created.vector_dac_trung,
      anh_khuon_mat: created.anh_khuon_mat,
      da_xac_minh: created.da_xac_minh,
      so_anh_dang_ky: created.so_anh_dang_ky,
      ngay_tao: created.ngay_tao,
      ngay_cap_nhat: created.ngay_cap_nhat
    };
  }

  async update(id: string, data: {
    vector_dac_trung?: number[];
    anh_khuon_mat?: string;
    da_xac_minh?: boolean;
    so_anh_dang_ky?: number;
  }): Promise<DuLieuKhuonMatData> {
    const updated = await prisma.duLieuKhuonMat.update({
      where: { id },
      data: {
        ...(data.vector_dac_trung && { vector_dac_trung: data.vector_dac_trung }),
        ...(data.anh_khuon_mat !== undefined && { anh_khuon_mat: data.anh_khuon_mat }),
        ...(data.da_xac_minh !== undefined && { da_xac_minh: data.da_xac_minh }),
        ...(data.so_anh_dang_ky !== undefined && { so_anh_dang_ky: data.so_anh_dang_ky })
      }
    });

    return {
      id: updated.id,
      sinh_vien_id: updated.sinh_vien_id,
      vector_dac_trung: updated.vector_dac_trung,
      anh_khuon_mat: updated.anh_khuon_mat,
      da_xac_minh: updated.da_xac_minh,
      so_anh_dang_ky: updated.so_anh_dang_ky,
      ngay_tao: updated.ngay_tao,
      ngay_cap_nhat: updated.ngay_cap_nhat
    };
  }

  async upsertBySinhVienId(sinhVienId: string, data: {
    vector_dac_trung: number[];
    so_anh_dang_ky?: number;
  }): Promise<{ data: DuLieuKhuonMatData; isUpdate: boolean }> {
    // Atomic upsert - tránh race condition giữa check + update
    const existing = await prisma.duLieuKhuonMat.findUnique({
      where: { sinh_vien_id: sinhVienId },
      select: { id: true }
    });

    const result = await prisma.duLieuKhuonMat.upsert({
      where: { sinh_vien_id: sinhVienId },
      create: {
        sinh_vien_id: sinhVienId,
        vector_dac_trung: data.vector_dac_trung,
        so_anh_dang_ky: data.so_anh_dang_ky || 1,
        da_xac_minh: false
      },
      update: {
        vector_dac_trung: data.vector_dac_trung,
        so_anh_dang_ky: data.so_anh_dang_ky || 1
      }
    });

    return {
      data: {
        id: result.id,
        sinh_vien_id: result.sinh_vien_id,
        vector_dac_trung: result.vector_dac_trung,
        anh_khuon_mat: result.anh_khuon_mat,
        da_xac_minh: result.da_xac_minh,
        so_anh_dang_ky: result.so_anh_dang_ky,
        ngay_tao: result.ngay_tao,
        ngay_cap_nhat: result.ngay_cap_nhat
      },
      isUpdate: !!existing
    };
  }

  async delete(id: string): Promise<void> {
    await prisma.duLieuKhuonMat.delete({
      where: { id }
    });
  }

  async createFaceAttendance(data: {
    nguoi_diem_danh_id: string;
    sv_id: string;
    hd_id: string;
    do_tin_cay_nhan_dien: number;
    ghi_chu: string;
  }) {
    return prisma.diemDanh.create({
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
        tg_diem_danh: true
      }
    });
  }

  async markRegistrationAsAttended(registrationId: string): Promise<void> {
    await prisma.dangKyHoatDong.update({
      where: { id: registrationId },
      data: { trang_thai_dk: 'da_tham_gia' }
    });
  }

  async existsBySinhVienId(sinhVienId: string): Promise<boolean> {
    const count = await prisma.duLieuKhuonMat.count({
      where: { sinh_vien_id: sinhVienId }
    });
    return count > 0;
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
