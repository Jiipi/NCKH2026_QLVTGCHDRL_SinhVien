/**
 * Face Recognition Controller
 * ============================
 * Controller xử lý các request liên quan đến nhận diện khuôn mặt
 */

import { Request, Response } from 'express';
import { RegisterFaceUseCase, FaceAttendanceUseCase, GetFaceStatusUseCase } from '../../business/services';
import { faceRecognitionClient } from '../../services';
import { ApiResponse, sendResponse } from '../../../../core/utils/response';

class FaceRecognitionController {
  private registerFaceUseCase: RegisterFaceUseCase;
  private faceAttendanceUseCase: FaceAttendanceUseCase;
  private getFaceStatusUseCase: GetFaceStatusUseCase;

  constructor() {
    this.registerFaceUseCase = new RegisterFaceUseCase();
    this.faceAttendanceUseCase = new FaceAttendanceUseCase();
    this.getFaceStatusUseCase = new GetFaceStatusUseCase();
  }

  /**
   * GET /api/face/health
   * Kiểm tra trạng thái Face Recognition Service
   */
  async healthCheck(req: Request, res: Response): Promise<Response> {
    try {
      const health = await faceRecognitionClient.healthCheck();
      return sendResponse(res, 200, ApiResponse.success(health, 'Face Recognition Service status'));
    } catch (error: any) {
      return sendResponse(res, 500, ApiResponse.error(error.message || 'Service không khả dụng', 500));
    }
  }

  /**
   * GET /api/face/status
   * Lấy trạng thái đăng ký khuôn mặt của sinh viên hiện tại
   */
  async getFaceStatus(req: Request, res: Response): Promise<Response> {
    try {
      const userId = (req as any).user?.sub;
      if (!userId) {
        return sendResponse(res, 401, ApiResponse.error('Chưa đăng nhập', 401));
      }

      const result = await this.getFaceStatusUseCase.execute(userId);
      return sendResponse(res, 200, ApiResponse.success(result, 'Trạng thái đăng ký khuôn mặt'));
    } catch (error: any) {
      const statusCode = error.statusCode || 500;
      return sendResponse(res, statusCode, ApiResponse.error(error.message || 'Lỗi lấy trạng thái', statusCode));
    }
  }

  /**
   * POST /api/face/register
   * Đăng ký khuôn mặt cho sinh viên
   * Body: multipart/form-data với field "file" (ảnh khuôn mặt)
   */
  async registerFace(req: Request, res: Response): Promise<Response> {
    try {
      const userId = (req as any).user?.sub;
      if (!userId) {
        return sendResponse(res, 401, ApiResponse.error('Chưa đăng nhập', 401));
      }

      const file = req.file;
      if (!file) {
        return sendResponse(res, 400, ApiResponse.error('Vui lòng upload ảnh khuôn mặt', 400));
      }

      const updateIfExists = req.body?.updateIfExists === 'true' || req.body?.updateIfExists === true;

      const result = await this.registerFaceUseCase.execute({
        userId,
        imageBuffer: file.buffer,
        updateIfExists
      });

      return sendResponse(res, 200, ApiResponse.success(result, result.message));
    } catch (error: any) {
      console.error('[FaceController] registerFace error:', error);
      const statusCode = error.statusCode || 500;
      return sendResponse(res, statusCode, ApiResponse.error(error.message || 'Lỗi đăng ký khuôn mặt', statusCode));
    }
  }

  /**
   * POST /api/face/attendance/:activityId
   * Điểm danh bằng khuôn mặt
   * Body: multipart/form-data với field "file" (ảnh khuôn mặt)
   */
  async faceAttendance(req: Request, res: Response): Promise<Response> {
    try {
      const userId = (req as any).user?.sub;
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

      const threshold = req.body?.threshold ? parseFloat(req.body.threshold) : undefined;

      const result = await this.faceAttendanceUseCase.execute({
        userId,
        activityId,
        imageBuffer: file.buffer,
        threshold
      });

      return sendResponse(res, 200, ApiResponse.success(result, result.message));
    } catch (error: any) {
      console.error('[FaceController] faceAttendance error:', error);
      const statusCode = error.statusCode || 500;
      return sendResponse(res, statusCode, ApiResponse.error(error.message || 'Lỗi điểm danh', statusCode));
    }
  }

  /**
   * DELETE /api/face/register
   * Xóa dữ liệu khuôn mặt đã đăng ký
   */
  async deleteFaceData(req: Request, res: Response): Promise<Response> {
    try {
      const userId = (req as any).user?.sub;
      if (!userId) {
        return sendResponse(res, 401, ApiResponse.error('Chưa đăng nhập', 401));
      }

      // Import repository trực tiếp
      const { faceDataRepository } = await import('../../data/repositories');
      const { prisma } = await import('../../../../data/infrastructure/prisma/client');

      // Tìm sinh viên
      const sinhVien = await prisma.sinhVien.findUnique({
        where: { nguoi_dung_id: userId },
        select: { id: true }
      });

      if (!sinhVien) {
        return sendResponse(res, 404, ApiResponse.error('Không tìm thấy sinh viên', 404));
      }

      // Tìm và xóa dữ liệu khuôn mặt
      const faceData = await faceDataRepository.findBySinhVienId(sinhVien.id);
      
      if (!faceData) {
        return sendResponse(res, 404, ApiResponse.error('Chưa đăng ký khuôn mặt', 404));
      }

      await faceDataRepository.delete(faceData.id);

      return sendResponse(res, 200, ApiResponse.success({ deleted: true }, 'Đã xóa dữ liệu khuôn mặt'));
    } catch (error: any) {
      console.error('[FaceController] deleteFaceData error:', error);
      const statusCode = error.statusCode || 500;
      return sendResponse(res, statusCode, ApiResponse.error(error.message || 'Lỗi xóa dữ liệu', statusCode));
    }
  }
}

export const faceRecognitionController = new FaceRecognitionController();
export default FaceRecognitionController;
