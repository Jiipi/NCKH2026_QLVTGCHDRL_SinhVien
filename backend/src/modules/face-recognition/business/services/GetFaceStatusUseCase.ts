/**
 * GetFaceStatusUseCase
 * =====================
 * Use case lấy trạng thái đăng ký khuôn mặt của sinh viên
 */

import { NotFoundError } from '../../../../core/errors/AppError';
import type { IFaceDataRepository } from '../interfaces';

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
  private faceDataRepository: IFaceDataRepository;

  constructor(faceDataRepository: IFaceDataRepository) {
    this.faceDataRepository = faceDataRepository;
  }

  async execute(userId: string): Promise<FaceStatusResult> {
    // 1. Tìm sinh viên theo nguoi_dung_id
    const sinhVien = await this.faceDataRepository.findStudentByUserId(userId);

    if (!sinhVien) {
      throw new NotFoundError('Không tìm thấy thông tin sinh viên');
    }

    // 2. Kiểm tra đã đăng ký khuôn mặt chưa
    const faceData = await this.faceDataRepository.findBySinhVienId(sinhVien.id);

    if (!faceData) {
      return {
        registered: false,
        sinhVienId: sinhVien.id,
        mssv: sinhVien.mssv,
        hoTen: sinhVien.ho_ten || ''
      };
    }

    return {
      registered: true,
      sinhVienId: sinhVien.id,
      mssv: sinhVien.mssv,
      hoTen: sinhVien.ho_ten || '',
      faceDataId: faceData.id,
      daXacMinh: faceData.da_xac_minh,
      soAnhDangKy: faceData.so_anh_dang_ky,
      ngayDangKy: faceData.ngay_tao,
      ngayCapNhat: faceData.ngay_cap_nhat
    };
  }
}

export default GetFaceStatusUseCase;
