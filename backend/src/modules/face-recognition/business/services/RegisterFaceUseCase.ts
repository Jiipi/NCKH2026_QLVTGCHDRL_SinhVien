/**
 * RegisterFaceUseCase
 * ====================
 * Use case đăng ký khuôn mặt cho sinh viên
 * Hỗ trợ đăng ký 1 ảnh hoặc nhiều ảnh (multi-image → average embedding)
 */

import { ValidationError, NotFoundError, ConflictError } from '../../../../core/errors/AppError';
import { faceRecognitionClient } from '../../services';
import type { IFaceDataRepository } from '../interfaces';
import type { AuditIntegrityActor } from '../../../audit-integrity/services/auditIntegrity.service';
import { CURRENT_CONSENT_VERSION } from './ConsentUseCases';
import { prisma } from '../../../../data/infrastructure/prisma/client';

interface RegisterFaceInput extends AuditIntegrityActor {
  userId: string;        // nguoi_dung_id
  imageBuffer?: Buffer;  // Ảnh khuôn mặt đơn (backwards-compatible)
  imageBuffers?: Buffer[]; // Nhiều ảnh khuôn mặt (multi-image registration)
  updateIfExists?: boolean; // Cho phép cập nhật nếu đã đăng ký
}

interface RegisterFaceResult {
  success: boolean;
  message: string;
  sinhVienId?: string;
  faceDataId?: string;
  isUpdate?: boolean;
  imagesProcessed?: number;
  imagesTotal?: number;
}

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

function toImageDataUrl(imageBase64: string | null | undefined): string | undefined {
  if (!imageBase64) return undefined;
  return imageBase64.startsWith('data:image/') ? imageBase64 : `data:image/jpeg;base64,${imageBase64}`;
}

function bufferToImageDataUrl(buffer: Buffer): string {
  return `data:image/jpeg;base64,${buffer.toString('base64')}`;
}

class RegisterFaceUseCase {
  private faceDataRepository: IFaceDataRepository;

  constructor(faceDataRepository: IFaceDataRepository) {
    this.faceDataRepository = faceDataRepository;
  }

  async execute(input: RegisterFaceInput): Promise<RegisterFaceResult> {
    const { userId, imageBuffer, imageBuffers, updateIfExists = false, requestId, ipAddress, userAgent } = input;

    // 1. Tìm sinh viên theo nguoi_dung_id
    const sinhVien = await this.faceDataRepository.findStudentByUserId(userId);

    if (!sinhVien) {
      throw new NotFoundError('Không tìm thấy thông tin sinh viên');
    }

    // 2. Kiểm tra đã đăng ký khuôn mặt chưa
    const existingFaceData = await this.faceDataRepository.findBySinhVienId(sinhVien.id);

    if (existingFaceData && !updateIfExists) {
      throw new ConflictError('Sinh viên đã đăng ký khuôn mặt. Sử dụng updateIfExists=true để cập nhật.');
    }

    // 2.5 Kiểm tra consent sinh trắc học
    const latestConsent = await prisma.dongYSinhTracHoc.findFirst({
      where: {
        sinh_vien_id: sinhVien.id,
        consent_version: CURRENT_CONSENT_VERSION,
        revoked_at: null
      }
    });

    if (!latestConsent) {
      throw new ValidationError(
        'Bạn cần đồng ý chính sách sinh trắc học trước khi đăng ký khuôn mặt.',
        { errorCode: 'CONSENT_REQUIRED' }
      );
    }

    // 3. Xác định dùng multi-image hay single-image
    const buffers = imageBuffers && imageBuffers.length > 0 ? imageBuffers : (imageBuffer ? [imageBuffer] : []);

    if (buffers.length === 0) {
      throw new ValidationError('Cần ít nhất 1 ảnh khuôn mặt để đăng ký');
    }

    let embedding: number[];
    let facePreviewImage: string | null | undefined;
    let facePreviewImages: string[] = [];
    let imagesProcessed = 0;
    let imagesTotal = buffers.length;

    if (buffers.length > 1) {
      // Multi-image registration: gửi tất cả ảnh → average embedding

      const faceResult = await faceRecognitionClient.registerMultiFace(buffers);

      if (!faceResult.success || !faceResult.embedding) {
        throw new ValidationError(faceResult.message || 'Không thể trích xuất đặc trưng khuôn mặt từ các ảnh');
      }

      if (faceResult.embedding.length !== 512) {
        throw new ValidationError(`Embedding không hợp lệ: ${faceResult.embedding.length} chiều (yêu cầu 512)`);
      }

      embedding = faceResult.embedding;
      facePreviewImages = buffers.slice(0, faceResult.images_processed).map(bufferToImageDataUrl);
      facePreviewImage = facePreviewImages[0];
      imagesProcessed = faceResult.images_processed;
    } else {
      // Single-image registration

      const faceResult = await faceRecognitionClient.registerFace(buffers[0]);

      if (!faceResult.success || !faceResult.embedding) {
        throw new ValidationError(faceResult.message || 'Không thể trích xuất đặc trưng khuôn mặt');
      }

      if (!faceResult.face_detected) {
        throw new ValidationError('Không phát hiện khuôn mặt trong ảnh');
      }

      if (faceResult.embedding_dim !== 512) {
        throw new ValidationError(`Embedding không hợp lệ: ${faceResult.embedding_dim} chiều (yêu cầu 512)`);
      }

      embedding = faceResult.embedding;
      facePreviewImage = toImageDataUrl(faceResult.aligned_face_base64) || bufferToImageDataUrl(buffers[0]);
      facePreviewImages = [facePreviewImage];
      imagesProcessed = 1;
    }

    // 4. Kiểm tra khuôn mặt trùng lặp với người khác
    const allFaceData = await this.faceDataRepository.findAllFaceData();
    for (const data of allFaceData) {
      if (data.sinh_vien_id === sinhVien.id) continue;

      const similarity = calculateCosineSimilarity(embedding, data.vector_dac_trung);
      if (similarity > 0.68) {
        throw new ConflictError(`Khuôn mặt này đã được đăng ký cho một tài khoản khác (độ tương đồng: ${(similarity * 100).toFixed(1)}%). Vui lòng liên hệ quản trị viên nếu đây là lỗi.`);
      }
    }

    // 5. Lưu hoặc cập nhật embedding vào database (atomic upsert - tránh race condition)
    // Lấy model info từ AI service health
    let modelName = 'buffalo_l';
    let modelVersion = '1.0.0';
    try {
      const health = await faceRecognitionClient.healthCheck();
      if ((health as any).model_name) modelName = (health as any).model_name;
      if ((health as any).model_version) modelVersion = (health as any).model_version;
    } catch (_) { /* use defaults */ }

    const upsertResult = await this.faceDataRepository.upsertBySinhVienId(sinhVien.id, {
      vector_dac_trung: embedding,
      anh_khuon_mat: facePreviewImage,
      anh_khuon_mat_ds: facePreviewImages,
      so_anh_dang_ky: imagesProcessed,
      model_name: modelName,
      model_version: modelVersion,
      audit: {
        actorId: userId,
        requestId,
        ipAddress,
        userAgent
      }
    });

    const faceData = upsertResult.data;
    const isUpdate = upsertResult.isUpdate;

    return {
      success: true,
      message: isUpdate
        ? `Cập nhật khuôn mặt thành công (${imagesProcessed}/${imagesTotal} ảnh)`
        : `Đăng ký khuôn mặt thành công (${imagesProcessed}/${imagesTotal} ảnh)`,
      sinhVienId: sinhVien.id,
      faceDataId: faceData.id,
      isUpdate,
      imagesProcessed,
      imagesTotal
    };
  }
}

export default RegisterFaceUseCase;
