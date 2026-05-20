/**
 * FaceAttendanceUseCase
 * ======================
 * Use case điểm danh bằng khuôn mặt
 */

import { ValidationError, NotFoundError, ForbiddenError } from '../../../../core/errors/AppError';
import { evaluateGeofence, normalizeAttendanceLocation } from '../../../../core/utils/geofence';
import type { AttendanceLocationInput } from '../../../../core/utils/geofence';
import { faceRecognitionClient } from '../../services';
import type { IFaceDataRepository, FaceAuditContext } from '../interfaces';

// Ngưỡng similarity mặc định
const DEFAULT_THRESHOLD = 0.68;

// Tính cosine similarity inline — tránh gọi AI service /verify
function calculateCosineSimilarity(vecA: number[], vecB: number[]): number {
  let dotProduct = 0;
  let normA = 0;
  let normB = 0;
  for (let i = 0; i < vecA.length; i++) {
    dotProduct += vecA[i] * vecB[i];
    normA += vecA[i] * vecA[i];
    normB += vecB[i] * vecB[i];
  }
  if (normA === 0 || normB === 0) return 0;
  return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
}

interface FaceAttendanceInput extends FaceAuditContext {
  userId: string;           // nguoi_dung_id
  activityId: string;       // hoat_dong_id
  imageBuffer: Buffer;      // Ảnh khuôn mặt
  threshold?: number;       // Ngưỡng nhận diện (mặc định 0.68)
  location?: AttendanceLocationInput | null; // Vị trí GPS khi điểm danh
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
    const { userId, activityId, imageBuffer, threshold = DEFAULT_THRESHOLD, location, requestId, ipAddress, userAgent } = input;

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

    // 2.5 Kiểm tra khuôn mặt đã được xác minh bởi admin/giảng viên
    if (!savedFaceData.da_xac_minh) {
      throw new ValidationError(
        'Dữ liệu khuôn mặt của bạn chưa được xác minh. Vui lòng chờ quản trị viên hoặc giảng viên xác minh.',
        { errorCode: 'NOT_VERIFIED' }
      );
    }

    // 3. Kiểm tra hoạt động tồn tại và đang diễn ra
    const activity = await this.faceDataRepository.findActivityById(activityId);

    if (!activity) {
      throw new NotFoundError('Hoạt động không tồn tại');
    }

    // Kiểm tra thời gian hoạt động (30 phút leeway cho sai số đồng hồ)
    const now = new Date();
    const leeway = 30 * 60 * 1000; // 30 phút leeway
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

    // 5.5. Kiểm tra vị trí GPS (geofence) — tương tự QR attendance
    const normalizedLocation = normalizeAttendanceLocation(location);
    const geofence = evaluateGeofence({
      latitude: activity.geo_latitude?.toString(),
      longitude: activity.geo_longitude?.toString(),
      radiusMeters: activity.geo_radius_meters,
      required: activity.yeu_cau_gps,
      cho_phep_fallback: activity.cho_phep_fallback
    }, location);

    if (!geofence.allowed) {
      const canRequestFallback = Boolean(activity.cho_phep_fallback);
      const message = geofence.reason === 'low_gps_accuracy'
        ? 'GPS có sai số quá lớn, vui lòng thử lại hoặc gửi yêu cầu điểm danh thủ công'
        : geofence.reason === 'outside_geofence'
          ? 'Bạn đang ở ngoài khu vực điểm danh cho phép'
          : 'Thiếu vị trí GPS để điểm danh hoạt động này';

      throw new ValidationError(message, {
        reason: geofence.reason || geofence.result,
        canRequestFallback,
        geofence
      });
    }

    // 6. Trích xuất embedding từ ảnh hiện tại

    const embedResult = await faceRecognitionClient.extractEmbedding(imageBuffer);

    if (!embedResult.success || !embedResult.embedding) {
      throw new ValidationError(embedResult.message || 'Không thể nhận diện khuôn mặt từ ảnh');
    }

    // 7. So sánh với embedding đã lưu (inline cosine similarity — không gọi AI /verify)
    const similarity = calculateCosineSimilarity(savedFaceData.vector_dac_trung, embedResult.embedding);
    const isMatch = similarity >= threshold;

    if (!isMatch) {
      throw new ValidationError(
        `Khuôn mặt không khớp (độ tương đồng: ${(similarity * 100).toFixed(1)}%, yêu cầu: ${(threshold * 100).toFixed(1)}%)`
      );
    }

    // 8. Tạo bản ghi điểm danh (bao gồm dữ liệu GPS)
    const gpsText = normalizedLocation ? `${normalizedLocation.latitude},${normalizedLocation.longitude}` : null;
    const audit = {
      actorId: userId,
      requestId,
      ipAddress,
      userAgent
    };

    const attendance = await this.faceDataRepository.createFaceAttendance({
      nguoi_diem_danh_id: userId,
      sv_id: sinhVien.id,
      hd_id: activityId,
      do_tin_cay_nhan_dien: similarity,
      ghi_chu: `Điểm danh bằng nhận diện khuôn mặt (similarity: ${(similarity * 100).toFixed(1)}%)`,
      vi_tri_gps: gpsText,
      gps_latitude: normalizedLocation?.latitude ?? null,
      gps_longitude: normalizedLocation?.longitude ?? null,
      gps_accuracy_m: geofence.accuracyMeters ?? normalizedLocation?.accuracy ?? null,
      khoang_cach_m: geofence.distanceMeters ?? null,
      ket_qua_geofence: geofence.result,
      audit
    });

    // 9. Cập nhật trạng thái đăng ký thành "đã tham gia"
    await this.faceDataRepository.markRegistrationAsAttended(registration.id, {
      ...audit,
      attendanceId: attendance.id,
      svId: sinhVien.id,
      activityId
    });

    // Log attendance success đã được ghi vào database qua ghi_chu field

    return {
      success: true,
      message: 'Điểm danh thành công!',
      attendanceId: attendance.id,
      activityId: activity.id,
      activityName: activity.ten_hd,
      similarity,
      threshold,
      timestamp: attendance.tg_diem_danh
    };
  }
}

export default FaceAttendanceUseCase;
