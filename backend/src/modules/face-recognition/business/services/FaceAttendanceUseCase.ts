/**
 * FaceAttendanceUseCase
 * ======================
 * Use case điểm danh bằng khuôn mặt
 */

import { ValidationError, NotFoundError, ForbiddenError } from '../../../../core/errors/AppError';
import { faceRecognitionClient } from '../../services';
import type { IFaceDataRepository } from '../interfaces';

// Ngưỡng similarity mặc định
const DEFAULT_THRESHOLD = 0.68;

interface FaceAttendanceInput {
  userId: string;           // nguoi_dung_id
  activityId: string;       // hoat_dong_id
  imageBuffer: Buffer;      // Ảnh khuôn mặt
  threshold?: number;       // Ngưỡng nhận diện (mặc định 0.68)
}

interface FaceAttendanceResult {
  success: boolean;
  message: string;
  attendanceId?: string;
  activityId?: string;
  activityName?: string;
  similarity?: number;
  threshold?: number;
  timestamp?: Date;
}

class FaceAttendanceUseCase {
  private faceDataRepository: IFaceDataRepository;

  constructor(faceDataRepository: IFaceDataRepository) {
    this.faceDataRepository = faceDataRepository;
  }

  async execute(input: FaceAttendanceInput): Promise<FaceAttendanceResult> {
    const { userId, activityId, imageBuffer, threshold = DEFAULT_THRESHOLD } = input;

    // 1. Tìm sinh viên theo nguoi_dung_id
    const sinhVien = await this.faceDataRepository.findStudentByUserId(userId);

    if (!sinhVien) {
      throw new ForbiddenError('Chỉ sinh viên mới có thể điểm danh bằng khuôn mặt');
    }

    // 2. Kiểm tra sinh viên đã đăng ký khuôn mặt chưa
    const savedFaceData = await this.faceDataRepository.findBySinhVienId(sinhVien.id);

    if (!savedFaceData) {
      throw new ValidationError('Bạn chưa đăng ký khuôn mặt. Vui lòng đăng ký trước khi điểm danh.');
    }

    // 3. Kiểm tra hoạt động tồn tại và đang diễn ra
    const activity = await this.faceDataRepository.findActivityById(activityId);

    if (!activity) {
      throw new NotFoundError('Hoạt động không tồn tại');
    }

    // Kiểm tra thời gian hoạt động (Cho phép điểm danh sớm 12 tiếng để xử lý lỗi lệch múi giờ UTC/Local)
    const now = new Date();
    const leeway = 12 * 60 * 60 * 1000; // 12 hours leeway
    if (now.getTime() + leeway < activity.ngay_bd.getTime()) {
      throw new ValidationError(`Hoạt động chưa bắt đầu. Thời gian bắt đầu: ${activity.ngay_bd.toLocaleString('vi-VN')}`);
    }
    if (now.getTime() - leeway > activity.ngay_kt.getTime()) {
      throw new ValidationError(`Hoạt động đã kết thúc lúc ${activity.ngay_kt.toLocaleString('vi-VN')}`);
    }

    // 4. Kiểm tra đã đăng ký hoạt động và được duyệt
    const registration = await this.faceDataRepository.findRegistrationByStudentAndActivity(sinhVien.id, activityId);

    if (!registration) {
      throw new ValidationError('Bạn chưa đăng ký hoạt động này');
    }

    if (registration.trang_thai_dk !== 'da_duyet') {
      throw new ValidationError('Đăng ký chưa được duyệt, không thể điểm danh');
    }

    // 5. Kiểm tra đã điểm danh chưa
    const existingAttendance = await this.faceDataRepository.findAttendanceByStudentAndActivity(sinhVien.id, activityId);

    if (existingAttendance) {
      throw new ValidationError('Bạn đã điểm danh hoạt động này rồi');
    }

    // 6. Trích xuất embedding từ ảnh hiện tại

    const embedResult = await faceRecognitionClient.extractEmbedding(imageBuffer);

    if (!embedResult.success || !embedResult.embedding) {
      throw new ValidationError(embedResult.message || 'Không thể nhận diện khuôn mặt từ ảnh');
    }

    // 7. So sánh với embedding đã lưu
    const verifyResult = await faceRecognitionClient.verifyEmbeddings({
      embedding1: savedFaceData.vector_dac_trung,
      embedding2: embedResult.embedding,
      threshold
    });

    if (!verifyResult.is_match) {
      throw new ValidationError(
        `Khuôn mặt không khớp (độ tương đồng: ${(verifyResult.similarity * 100).toFixed(1)}%, yêu cầu: ${(threshold * 100).toFixed(1)}%)`
      );
    }

    // 8. Tạo bản ghi điểm danh
    const attendance = await this.faceDataRepository.createFaceAttendance({
      nguoi_diem_danh_id: userId,
      sv_id: sinhVien.id,
      hd_id: activityId,
      do_tin_cay_nhan_dien: verifyResult.similarity,
      ghi_chu: `Điểm danh bằng nhận diện khuôn mặt (similarity: ${(verifyResult.similarity * 100).toFixed(1)}%)`
    });

    // 9. Cập nhật trạng thái đăng ký thành "đã tham gia"
    await this.faceDataRepository.markRegistrationAsAttended(registration.id);

    // Log attendance success đã được ghi vào database qua ghi_chu field

    return {
      success: true,
      message: 'Điểm danh thành công!',
      attendanceId: attendance.id,
      activityId: activity.id,
      activityName: activity.ten_hd,
      similarity: verifyResult.similarity,
      threshold,
      timestamp: attendance.tg_diem_danh
    };
  }
}

export default FaceAttendanceUseCase;
