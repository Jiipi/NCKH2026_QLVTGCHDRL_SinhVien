/**
 * Face Data Repository
 * =====================
 * Repository cho thao tác với bảng du_lieu_khuon_mat
 */

import { prisma } from '../../../../data/infrastructure/prisma/client';
import type { IFaceDataRepository, DuLieuKhuonMatData } from '../../business/interfaces';

class FaceDataRepository implements IFaceDataRepository {
  
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

  async delete(id: string): Promise<void> {
    await prisma.duLieuKhuonMat.delete({
      where: { id }
    });
  }

  async existsBySinhVienId(sinhVienId: string): Promise<boolean> {
    const count = await prisma.duLieuKhuonMat.count({
      where: { sinh_vien_id: sinhVienId }
    });
    return count > 0;
  }
}

export const faceDataRepository = new FaceDataRepository();
export default FaceDataRepository;
