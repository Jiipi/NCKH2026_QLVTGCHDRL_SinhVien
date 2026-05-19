import { ValidationError, NotFoundError } from '../../../../core/errors/AppError';
import { faceRecognitionClient } from '../../services';
import type { IFaceDataRepository, FaceAuditContext, ClassFaceDataSnapshot } from '../interfaces';

const DEFAULT_THRESHOLD = 0.68;
const ATTENDANCE_TIME_LEEWAY_MS = 30 * 60 * 1000; // 30 phút leeway (thay vì 12h trước đây)
const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

type MarkedStudent = {
  studentId: string;
  mssv: string;
  hoTen: string;
  attendanceId: string;
  similarity: number;
  sourceImageIndex: number;
};

type SkippedStudent = {
  sourceImageIndex: number;
  reason: string;
  studentId?: string;
  mssv?: string;
  hoTen?: string;
  similarity?: number;
};

type MonitorBulkFaceAttendanceInput = FaceAuditContext & {
  monitorUserId: string;
  monitorClassId: string;
  activityId: string;
  imageBuffers: Buffer[];
};

type MonitorBulkFaceAttendanceResult = {
  success: boolean;
  activityId: string;
  activityName: string;
  totalImages: number;
  marked: MarkedStudent[];
  skipped: SkippedStudent[];
};

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

function findBestMatch(embedding: number[], candidates: ClassFaceDataSnapshot[]) {
  let bestMatch: { faceData: ClassFaceDataSnapshot; similarity: number } | null = null;

  for (const faceData of candidates) {
    const similarity = calculateCosineSimilarity(embedding, faceData.vector_dac_trung);
    if (!bestMatch || similarity > bestMatch.similarity) {
      bestMatch = { faceData, similarity };
    }
  }

  return bestMatch;
}

class MonitorBulkFaceAttendanceUseCase {
  constructor(private readonly faceDataRepository: IFaceDataRepository) {}

  async execute(input: MonitorBulkFaceAttendanceInput): Promise<MonitorBulkFaceAttendanceResult> {
    const { monitorUserId, monitorClassId, activityId, imageBuffers, requestId, ipAddress, userAgent } = input;

    if (!monitorClassId) {
      throw new ValidationError('Không xác định được lớp của lớp trưởng');
    }

    if (imageBuffers.length === 0) {
      throw new ValidationError('Vui lòng upload ít nhất 1 ảnh khuôn mặt');
    }

    if (!UUID_PATTERN.test(activityId)) {
      throw new ValidationError('ID hoạt động không hợp lệ');
    }

    const activity = await this.faceDataRepository.findActivityById(activityId);
    if (!activity) {
      throw new NotFoundError('Hoạt động không tồn tại');
    }

    const now = new Date();
    if (now.getTime() + ATTENDANCE_TIME_LEEWAY_MS < activity.ngay_bd.getTime()) {
      throw new ValidationError(`Hoạt động chưa bắt đầu. Thời gian bắt đầu: ${activity.ngay_bd.toLocaleString('vi-VN')}`);
    }
    if (now.getTime() - ATTENDANCE_TIME_LEEWAY_MS > activity.ngay_kt.getTime()) {
      throw new ValidationError(`Hoạt động đã kết thúc lúc ${activity.ngay_kt.toLocaleString('vi-VN')}`);
    }

    // Query đã lọc chỉ face data đã xác minh (da_xac_minh = true) ở repository level
    const classFaceData = await this.faceDataRepository.findFaceDataByClassId(monitorClassId);
    if (classFaceData.length === 0) {
      throw new ValidationError('Chưa có sinh viên nào trong lớp đăng ký khuôn mặt (đã xác minh)');
    }

    const marked: MarkedStudent[] = [];
    const skipped: SkippedStudent[] = [];
    const matchedStudentIds = new Set<string>();
    const audit = { actorId: monitorUserId, requestId, ipAddress, userAgent };

    for (let index = 0; index < imageBuffers.length; index++) {
      const sourceImageIndex = index + 1;
      const embedResult = await faceRecognitionClient.extractEmbedding(imageBuffers[index]);

      if (!embedResult.success || !embedResult.embedding) {
        skipped.push({
          sourceImageIndex,
          reason: embedResult.message || 'Không thể nhận diện khuôn mặt từ ảnh'
        });
        continue;
      }

      const bestMatch = findBestMatch(embedResult.embedding, classFaceData);
      if (!bestMatch || bestMatch.similarity < DEFAULT_THRESHOLD) {
        skipped.push({
          sourceImageIndex,
          reason: 'Không tìm thấy sinh viên phù hợp trong lớp',
          similarity: bestMatch?.similarity
        });
        continue;
      }

      const student = bestMatch.faceData.sinh_vien;
      if (matchedStudentIds.has(student.id)) {
        skipped.push({
          sourceImageIndex,
          reason: 'Sinh viên đã được nhận diện trong batch này',
          studentId: student.id,
          mssv: student.mssv,
          hoTen: student.ho_ten,
          similarity: bestMatch.similarity
        });
        continue;
      }

      const registration = await this.faceDataRepository.findRegistrationByStudentAndActivity(student.id, activityId);
      if (!registration) {
        skipped.push({
          sourceImageIndex,
          reason: 'Sinh viên chưa đăng ký hoạt động này',
          studentId: student.id,
          mssv: student.mssv,
          hoTen: student.ho_ten,
          similarity: bestMatch.similarity
        });
        continue;
      }

      if (registration.trang_thai_dk !== 'da_duyet') {
        skipped.push({
          sourceImageIndex,
          reason: registration.trang_thai_dk === 'da_tham_gia' ? 'Sinh viên đã tham gia hoạt động này' : 'Đăng ký của sinh viên chưa được duyệt',
          studentId: student.id,
          mssv: student.mssv,
          hoTen: student.ho_ten,
          similarity: bestMatch.similarity
        });
        continue;
      }

      const existingAttendance = await this.faceDataRepository.findAttendanceByStudentAndActivity(student.id, activityId);
      if (existingAttendance) {
        skipped.push({
          sourceImageIndex,
          reason: 'Sinh viên đã điểm danh hoạt động này',
          studentId: student.id,
          mssv: student.mssv,
          hoTen: student.ho_ten,
          similarity: bestMatch.similarity
        });
        continue;
      }

      try {
        const attendance = await this.faceDataRepository.createFaceAttendanceAndMarkRegistration({
          registrationId: registration.id,
          nguoi_diem_danh_id: monitorUserId,
          sv_id: student.id,
          hd_id: activityId,
          do_tin_cay_nhan_dien: bestMatch.similarity,
          ghi_chu: `Điểm danh bằng nhận diện khuôn mặt bởi lớp trưởng (similarity: ${(bestMatch.similarity * 100).toFixed(1)}%)`,
          audit
        });

        matchedStudentIds.add(student.id);
        marked.push({
          studentId: student.id,
          mssv: student.mssv,
          hoTen: student.ho_ten,
          attendanceId: attendance.id,
          similarity: bestMatch.similarity,
          sourceImageIndex
        });
      } catch {
        skipped.push({
          sourceImageIndex,
          reason: 'Không thể ghi điểm danh, có thể sinh viên vừa được điểm danh trước đó',
          studentId: student.id,
          mssv: student.mssv,
          hoTen: student.ho_ten,
          similarity: bestMatch.similarity
        });
      }
    }

    return {
      success: marked.length > 0,
      activityId: activity.id,
      activityName: activity.ten_hd,
      totalImages: imageBuffers.length,
      marked,
      skipped
    };
  }
}

export default MonitorBulkFaceAttendanceUseCase;
