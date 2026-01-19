/**
 * GetFaceStatusUseCase
 * =====================
 * Use case lấy trạng thái đăng ký khuôn mặt của sinh viên
 */

import { NotFoundError } from '../../../../core/errors/AppError';
import { prisma } from '../../../../data/infrastructure/prisma/client';
import { faceDataRepository } from '../../data/repositories';

interface FaceStatusResult {
  registered: boolean;
  sinhVienId: string;
  mssv: string;
  hoTen: string;
  faceDataId?: string;
  daXacMinh?: boolean;
  soAnhDangKy?: number;
  ngayDangKy?: Date;
  ngayCapNhat?: Date;
}

class GetFaceStatusUseCase {
  async execute(userId: string): Promise<FaceStatusResult> {
    // 1. Tìm sinh viên theo nguoi_dung_id
    const sinhVien = await prisma.sinhVien.findUnique({
      where: { nguoi_dung_id: userId },
      select: { 
        id: true, 
        mssv: true, 
        nguoi_dung: { select: { ho_ten: true } } 
      }
    });

    if (!sinhVien) {
      throw new NotFoundError('Không tìm thấy thông tin sinh viên');
    }

    // 2. Kiểm tra đã đăng ký khuôn mặt chưa
    const faceData = await faceDataRepository.findBySinhVienId(sinhVien.id);

    if (!faceData) {
      return {
        registered: false,
        sinhVienId: sinhVien.id,
        mssv: sinhVien.mssv,
        hoTen: sinhVien.nguoi_dung?.ho_ten || ''
      };
    }

    return {
      registered: true,
      sinhVienId: sinhVien.id,
      mssv: sinhVien.mssv,
      hoTen: sinhVien.nguoi_dung?.ho_ten || '',
      faceDataId: faceData.id,
      daXacMinh: faceData.da_xac_minh,
      soAnhDangKy: faceData.so_anh_dang_ky,
      ngayDangKy: faceData.ngay_tao,
      ngayCapNhat: faceData.ngay_cap_nhat
    };
  }
}

export default GetFaceStatusUseCase;
