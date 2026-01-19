/**
 * RegisterFaceUseCase
 * ====================
 * Use case đăng ký khuôn mặt cho sinh viên
 */

import { ValidationError, NotFoundError, ConflictError } from '../../../../core/errors/AppError';
import { prisma } from '../../../../data/infrastructure/prisma/client';
import { faceRecognitionClient } from '../../services';
import { faceDataRepository } from '../../data/repositories';

interface RegisterFaceInput {
  userId: string;        // nguoi_dung_id
  imageBuffer: Buffer;   // Ảnh khuôn mặt
  updateIfExists?: boolean; // Cho phép cập nhật nếu đã đăng ký
}

interface RegisterFaceResult {
  success: boolean;
  message: string;
  sinhVienId?: string;
  faceDataId?: string;
  isUpdate?: boolean;
}

class RegisterFaceUseCase {
  async execute(input: RegisterFaceInput): Promise<RegisterFaceResult> {
    const { userId, imageBuffer, updateIfExists = false } = input;

    // 1. Tìm sinh viên theo nguoi_dung_id
    const sinhVien = await prisma.sinhVien.findUnique({
      where: { nguoi_dung_id: userId },
      select: { id: true, mssv: true, nguoi_dung: { select: { ho_ten: true } } }
    });

    if (!sinhVien) {
      throw new NotFoundError('Không tìm thấy thông tin sinh viên');
    }

    // 2. Kiểm tra đã đăng ký khuôn mặt chưa
    const existingFaceData = await faceDataRepository.findBySinhVienId(sinhVien.id);

    if (existingFaceData && !updateIfExists) {
      throw new ConflictError('Sinh viên đã đăng ký khuôn mặt. Sử dụng updateIfExists=true để cập nhật.');
    }

    // 3. Gọi Python service để đăng ký khuôn mặt
    console.log(`[RegisterFace] Đăng ký khuôn mặt cho sinh viên ${sinhVien.mssv}...`);

    const faceResult = await faceRecognitionClient.registerFace(imageBuffer);

    if (!faceResult.success || !faceResult.embedding) {
      throw new ValidationError(faceResult.message || 'Không thể trích xuất đặc trưng khuôn mặt');
    }

    if (!faceResult.face_detected) {
      throw new ValidationError('Không phát hiện khuôn mặt trong ảnh');
    }

    if (faceResult.embedding_dim !== 512) {
      throw new ValidationError(`Embedding không hợp lệ: ${faceResult.embedding_dim} chiều (yêu cầu 512)`);
    }

    // 4. Lưu hoặc cập nhật embedding vào database
    let faceData;
    let isUpdate = false;

    if (existingFaceData) {
      // Cập nhật
      faceData = await faceDataRepository.update(existingFaceData.id, {
        vector_dac_trung: faceResult.embedding,
        // Không lưu base64 image vì column anh_khuon_mat chỉ có 255 ký tự
        // Chỉ cần embedding vector cho nhận diện
        so_anh_dang_ky: existingFaceData.so_anh_dang_ky + 1
      });
      isUpdate = true;
      console.log(`[RegisterFace] Cập nhật khuôn mặt cho ${sinhVien.mssv}`);
    } else {
      // Tạo mới
      faceData = await faceDataRepository.create({
        sinh_vien_id: sinhVien.id,
        vector_dac_trung: faceResult.embedding,
        // Không lưu base64 image - column quá nhỏ
        so_anh_dang_ky: 1
      });
      console.log(`[RegisterFace] Đăng ký khuôn mặt mới cho ${sinhVien.mssv}`);
    }

    return {
      success: true,
      message: isUpdate
        ? 'Cập nhật khuôn mặt thành công'
        : 'Đăng ký khuôn mặt thành công',
      sinhVienId: sinhVien.id,
      faceDataId: faceData.id,
      isUpdate
    };
  }
}

export default RegisterFaceUseCase;
