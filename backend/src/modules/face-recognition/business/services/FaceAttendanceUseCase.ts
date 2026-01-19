/**
 * FaceAttendanceUseCase
 * ======================
 * Use case điểm danh bằng khuôn mặt
 */

import { ValidationError, NotFoundError, ForbiddenError } from '../../../../core/errors/AppError';
import { prisma } from '../../../../data/infrastructure/prisma/client';
import { faceRecognitionClient } from '../../services';
import { faceDataRepository } from '../../data/repositories';

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
  async execute(input: FaceAttendanceInput): Promise<FaceAttendanceResult> {
    const { userId, activityId, imageBuffer, threshold = DEFAULT_THRESHOLD } = input;

    // 1. Tìm sinh viên theo nguoi_dung_id
    const sinhVien = await prisma.sinhVien.findUnique({
      where: { nguoi_dung_id: userId },
      select: { id: true, mssv: true, nguoi_dung: { select: { ho_ten: true } } }
    });

    if (!sinhVien) {
      throw new ForbiddenError('Chỉ sinh viên mới có thể điểm danh bằng khuôn mặt');
    }

    // 2. Kiểm tra sinh viên đã đăng ký khuôn mặt chưa
    const savedFaceData = await faceDataRepository.findBySinhVienId(sinhVien.id);
    
    if (!savedFaceData) {
      throw new ValidationError('Bạn chưa đăng ký khuôn mặt. Vui lòng đăng ký trước khi điểm danh.');
    }

    // 3. Kiểm tra hoạt động tồn tại và đang diễn ra
    const activity = await prisma.hoatDong.findUnique({
      where: { id: activityId },
      select: {
        id: true,
        ten_hd: true,
        ngay_bd: true,
        ngay_kt: true,
        trang_thai: true
      }
    });

    if (!activity) {
      throw new NotFoundError('Hoạt động không tồn tại');
    }

    // Kiểm tra thời gian hoạt động
    const now = new Date();
    if (now < activity.ngay_bd) {
      throw new ValidationError(`Hoạt động chưa bắt đầu. Thời gian bắt đầu: ${activity.ngay_bd.toLocaleString('vi-VN')}`);
    }
    if (now > activity.ngay_kt) {
      throw new ValidationError(`Hoạt động đã kết thúc lúc ${activity.ngay_kt.toLocaleString('vi-VN')}`);
    }

    // 4. Kiểm tra đã đăng ký hoạt động và được duyệt
    const registration = await prisma.dangKyHoatDong.findUnique({
      where: {
        sv_id_hd_id: { sv_id: sinhVien.id, hd_id: activityId }
      },
      select: { id: true, trang_thai_dk: true }
    });

    if (!registration) {
      throw new ValidationError('Bạn chưa đăng ký hoạt động này');
    }

    if (registration.trang_thai_dk !== 'da_duyet') {
      throw new ValidationError('Đăng ký chưa được duyệt, không thể điểm danh');
    }

    // 5. Kiểm tra đã điểm danh chưa
    const existingAttendance = await prisma.diemDanh.findUnique({
      where: {
        sv_id_hd_id: { sv_id: sinhVien.id, hd_id: activityId }
      }
    });

    if (existingAttendance) {
      throw new ValidationError('Bạn đã điểm danh hoạt động này rồi');
    }

    // 6. Trích xuất embedding từ ảnh hiện tại
    console.log(`[FaceAttendance] Xác minh khuôn mặt cho ${sinhVien.mssv}...`);
    
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

    console.log(`[FaceAttendance] Similarity: ${verifyResult.similarity}, Threshold: ${threshold}`);

    if (!verifyResult.is_match) {
      throw new ValidationError(
        `Khuôn mặt không khớp (độ tương đồng: ${(verifyResult.similarity * 100).toFixed(1)}%, yêu cầu: ${(threshold * 100).toFixed(1)}%)`
      );
    }

    // 8. Tạo bản ghi điểm danh
    const attendance = await prisma.diemDanh.create({
      data: {
        nguoi_diem_danh_id: userId,
        sv_id: sinhVien.id,
        hd_id: activityId,
        phuong_thuc: 'khuon_mat',
        trang_thai_tham_gia: 'co_mat',
        xac_nhan_tham_gia: true,
        do_tin_cay_nhan_dien: verifyResult.similarity,
        ghi_chu: `Điểm danh bằng nhận diện khuôn mặt (similarity: ${(verifyResult.similarity * 100).toFixed(1)}%)`
      }
    });

    // 9. Cập nhật trạng thái đăng ký thành "đã tham gia"
    await prisma.dangKyHoatDong.update({
      where: { id: registration.id },
      data: { trang_thai_dk: 'da_tham_gia' }
    });

    console.log(`[FaceAttendance] ✅ Điểm danh thành công cho ${sinhVien.mssv} - ${activity.ten_hd}`);

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
