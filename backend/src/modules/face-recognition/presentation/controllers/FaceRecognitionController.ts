/**
 * Face Recognition Controller
 * ============================
 * Controller xử lý các request liên quan đến nhận diện khuôn mặt
 */

import { Request, Response } from 'express';
import { RegisterFaceUseCase, FaceAttendanceUseCase, GetFaceStatusUseCase } from '../../business/services';
import { faceRecognitionClient } from '../../services';
import { faceDataRepository } from '../../data/repositories';
import type { IFaceDataRepository } from '../../business/interfaces';
import { ApiResponse, sendResponse } from '../../../../core/utils/response';

interface AuthenticatedRequest extends Request {
  user?: {
    sub?: string;
  };
  file?: Express.Multer.File;
  files?: { [fieldname: string]: Express.Multer.File[] } | Express.Multer.File[];
}

type ErrorWithStatus = Error & { statusCode?: number };

function toErrorWithStatus(error: unknown): ErrorWithStatus {
  if (error instanceof Error) return error as ErrorWithStatus;
  return new Error(String(error));
}

class FaceRecognitionController {
  private registerFaceUseCase: RegisterFaceUseCase;
  private faceAttendanceUseCase: FaceAttendanceUseCase;
  private getFaceStatusUseCase: GetFaceStatusUseCase;
  private readonly faceDataRepository: IFaceDataRepository;

  constructor() {
    this.faceDataRepository = faceDataRepository;
    this.registerFaceUseCase = new RegisterFaceUseCase(faceDataRepository);
    this.faceAttendanceUseCase = new FaceAttendanceUseCase(faceDataRepository);
    this.getFaceStatusUseCase = new GetFaceStatusUseCase(faceDataRepository);
  }

  /**
   * GET /api/face/health
   * Kiểm tra trạng thái Face Recognition Service
   */
  async healthCheck(_req: Request, res: Response): Promise<Response> {
    try {
      const health = await faceRecognitionClient.healthCheck();
      return sendResponse(res, 200, ApiResponse.success(health, 'Face Recognition Service status'));
    } catch (error: unknown) {
      const err = toErrorWithStatus(error);
      return sendResponse(res, 500, ApiResponse.error(err.message || 'Service không khả dụng', 500));
    }
  }

  /**
   * GET /api/face/status
   * Lấy trạng thái đăng ký khuôn mặt của sinh viên hiện tại
   */
  async getFaceStatus(req: AuthenticatedRequest, res: Response): Promise<Response> {
    try {
      const userId = req.user?.sub;
      if (!userId) {
        return sendResponse(res, 401, ApiResponse.error('Chưa đăng nhập', 401));
      }

      const result = await this.getFaceStatusUseCase.execute(userId);
      return sendResponse(res, 200, ApiResponse.success(result, 'Trạng thái đăng ký khuôn mặt'));
    } catch (error: unknown) {
      const err = toErrorWithStatus(error);
      const statusCode = err.statusCode || 500;
      return sendResponse(res, statusCode, ApiResponse.error(err.message || 'Lỗi lấy trạng thái', statusCode));
    }
  }

  /**
   * POST /api/face/register
   * Đăng ký khuôn mặt cho sinh viên
   * Hỗ trợ cả single file (field: "file") và multi files (field: "files")
   * Body: multipart/form-data với field "file" hoặc "files" (ảnh khuôn mặt)
   */
  async registerFace(req: AuthenticatedRequest, res: Response): Promise<Response> {
    try {
      const userId = req.user?.sub;
      if (!userId) {
        return sendResponse(res, 401, ApiResponse.error('Chưa đăng nhập', 401));
      }

      // upload.any() returns an array of files in req.files
      const multerFiles = req.files as Express.Multer.File[] | undefined;
      const singleFile = req.file;

      let imageBuffers: Buffer[] = [];

      if (Array.isArray(multerFiles)) {
        // Multi-file upload via upload.any()
        imageBuffers = multerFiles.map(f => f.buffer);
      } else if (singleFile) {
        // Single file upload (field: "file") - backward compatible
        imageBuffers = [singleFile.buffer];
      }

      if (imageBuffers.length === 0) {
        return sendResponse(res, 400, ApiResponse.error('Vui lòng upload ảnh khuôn mặt', 400));
      }

      const updateIfExists = req.body?.updateIfExists === 'true' || req.body?.updateIfExists === true;

      const result = await this.registerFaceUseCase.execute({
        userId,
        imageBuffers,
        updateIfExists
      });

      return sendResponse(res, 200, ApiResponse.success(result, result.message));
    } catch (error: unknown) {
      console.error('[FaceController] registerFace error:', error);
      const err = toErrorWithStatus(error);
      const statusCode = err.statusCode || 500;
      return sendResponse(res, statusCode, ApiResponse.error(err.message || 'Lỗi đăng ký khuôn mặt', statusCode));
    }
  }

  /**
   * POST /api/face/attendance/:activityId
   * Điểm danh bằng khuôn mặt
   * Body: multipart/form-data với field "file" (ảnh khuôn mặt)
   */
  async faceAttendance(req: AuthenticatedRequest, res: Response): Promise<Response> {
    try {
      const userId = req.user?.sub;
      if (!userId) {
        return sendResponse(res, 401, ApiResponse.error('Chưa đăng nhập', 401));
      }

      const { activityId } = req.params;
      if (!activityId) {
        return sendResponse(res, 400, ApiResponse.error('Thiếu ID hoạt động', 400));
      }

      const file = req.file;
      if (!file) {
        return sendResponse(res, 400, ApiResponse.error('Vui lòng upload ảnh khuôn mặt', 400));
      }

      // Threshold luôn dùng giá trị mặc định server-side (0.68)
      // KHÔNG cho phép client override để tránh bypass bảo mật
      const result = await this.faceAttendanceUseCase.execute({
        userId,
        activityId,
        imageBuffer: file.buffer,
      });

      return sendResponse(res, 200, ApiResponse.success(result, result.message));
    } catch (error: unknown) {
      console.error('[FaceController] faceAttendance error:', error);
      const err = toErrorWithStatus(error);
      const statusCode = err.statusCode || 500;
      return sendResponse(res, statusCode, ApiResponse.error(err.message || 'Lỗi điểm danh', statusCode));
    }
  }

  /**
   * DELETE /api/face/register
   * Xóa dữ liệu khuôn mặt đã đăng ký
   */
  async deleteFaceData(req: AuthenticatedRequest, res: Response): Promise<Response> {
    try {
      const userId = req.user?.sub;
      if (!userId) {
        return sendResponse(res, 401, ApiResponse.error('Chưa đăng nhập', 401));
      }

      const sinhVien = await this.faceDataRepository.findStudentByUserId(userId);

      if (!sinhVien) {
        return sendResponse(res, 404, ApiResponse.error('Không tìm thấy sinh viên', 404));
      }

      // Tìm và xóa dữ liệu khuôn mặt
      const faceData = await this.faceDataRepository.findBySinhVienId(sinhVien.id);

      if (!faceData) {
        return sendResponse(res, 404, ApiResponse.error('Chưa đăng ký khuôn mặt', 404));
      }

      await this.faceDataRepository.delete(faceData.id);

      return sendResponse(res, 200, ApiResponse.success({ deleted: true }, 'Đã xóa dữ liệu khuôn mặt'));
    } catch (error: unknown) {
      console.error('[FaceController] deleteFaceData error:', error);
      const err = toErrorWithStatus(error);
      const statusCode = err.statusCode || 500;
      return sendResponse(res, statusCode, ApiResponse.error(err.message || 'Lỗi xóa dữ liệu', statusCode));
    }
  }
}

export const faceRecognitionController = new FaceRecognitionController();
export default FaceRecognitionController;
