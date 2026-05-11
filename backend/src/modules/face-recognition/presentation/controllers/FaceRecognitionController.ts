/**
 * Face Recognition Controller
 * ============================
 * Controller xử lý các request liên quan đến nhận diện khuôn mặt
 */

import { Request, Response } from 'express';
import { RegisterFaceUseCase, FaceAttendanceUseCase, GetFaceStatusUseCase, MonitorBulkFaceAttendanceUseCase } from '../../business/services';
import { checkConsentUseCase, acceptConsentUseCase } from '../../business/services';
import { adminListFaceRegistrationsUseCase, adminVerifyFaceUseCase, adminRejectFaceUseCase } from '../../business/services';
import { faceRecognitionClient } from '../../services';
import { faceDataRepository } from '../../data/repositories';
import type { IFaceDataRepository } from '../../business/interfaces';
import { ApiResponse, sendResponse } from '../../../../core/utils/response';
import { prisma } from '../../../../data/infrastructure/prisma/client';

interface AuthenticatedRequest extends Request {
  user?: {
    sub?: string;
    role?: string;
  };
  requestId?: string;
  file?: Express.Multer.File;
  files?: { [fieldname: string]: Express.Multer.File[] } | Express.Multer.File[];
  classMonitor?: {
    lop_id: string;
  };
}

type ErrorWithStatus = Error & { statusCode?: number; details?: any };

function toErrorWithStatus(error: unknown): ErrorWithStatus {
  if (error instanceof Error) return error as ErrorWithStatus;
  return new Error(String(error));
}

class FaceRecognitionController {
  private registerFaceUseCase: RegisterFaceUseCase;
  private faceAttendanceUseCase: FaceAttendanceUseCase;
  private getFaceStatusUseCase: GetFaceStatusUseCase;
  private monitorBulkFaceAttendanceUseCase: MonitorBulkFaceAttendanceUseCase;
  private readonly faceDataRepository: IFaceDataRepository;

  constructor() {
    this.faceDataRepository = faceDataRepository;
    this.registerFaceUseCase = new RegisterFaceUseCase(faceDataRepository);
    this.faceAttendanceUseCase = new FaceAttendanceUseCase(faceDataRepository);
    this.getFaceStatusUseCase = new GetFaceStatusUseCase(faceDataRepository);
    this.monitorBulkFaceAttendanceUseCase = new MonitorBulkFaceAttendanceUseCase(faceDataRepository);
  }

  async healthCheck(_req: Request, res: Response): Promise<Response> {
    try {
      const health = await faceRecognitionClient.healthCheck();
      return sendResponse(res, 200, ApiResponse.success(health, 'Face Recognition Service status'));
    } catch (error: unknown) {
      const err = toErrorWithStatus(error);
      return sendResponse(res, 500, ApiResponse.error(err.message || 'Service không khả dụng', 500));
    }
  }

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

  // ========================
  // CONSENT ENDPOINTS
  // ========================

  async checkConsent(req: AuthenticatedRequest, res: Response): Promise<Response> {
    try {
      const userId = req.user?.sub;
      if (!userId) {
        return sendResponse(res, 401, ApiResponse.error('Chưa đăng nhập', 401));
      }
      const result = await checkConsentUseCase.execute(userId);
      return sendResponse(res, 200, ApiResponse.success(result, 'Trạng thái đồng ý sinh trắc học'));
    } catch (error: unknown) {
      const err = toErrorWithStatus(error);
      const statusCode = err.statusCode || 500;
      return sendResponse(res, statusCode, ApiResponse.error(err.message, statusCode));
    }
  }

  async acceptConsent(req: AuthenticatedRequest, res: Response): Promise<Response> {
    try {
      const userId = req.user?.sub;
      if (!userId) {
        return sendResponse(res, 401, ApiResponse.error('Chưa đăng nhập', 401));
      }
      const result = await acceptConsentUseCase.execute({
        userId,
        actorId: userId,
        requestId: req.requestId,
        ipAddress: req.ip,
        userAgent: req.get('User-Agent') || null
      });
      return sendResponse(res, 200, ApiResponse.success(result, result.message));
    } catch (error: unknown) {
      const err = toErrorWithStatus(error);
      const statusCode = err.statusCode || 500;
      return sendResponse(res, statusCode, ApiResponse.error(err.message, statusCode));
    }
  }

  // ========================
  // REGISTRATION ENDPOINTS
  // ========================

  async registerFace(req: AuthenticatedRequest, res: Response): Promise<Response> {
    try {
      const userId = req.user?.sub;
      if (!userId) {
        return sendResponse(res, 401, ApiResponse.error('Chưa đăng nhập', 401));
      }

      const multerFiles = req.files as Express.Multer.File[] | undefined;
      const singleFile = req.file;
      let imageBuffers: Buffer[] = [];

      if (Array.isArray(multerFiles)) {
        imageBuffers = multerFiles.map(f => f.buffer);
      } else if (singleFile) {
        imageBuffers = [singleFile.buffer];
      }

      if (imageBuffers.length === 0) {
        return sendResponse(res, 400, ApiResponse.error('Vui lòng upload ảnh khuôn mặt', 400));
      }

      const updateIfExists = req.body?.updateIfExists === 'true' || req.body?.updateIfExists === true;

      const result = await this.registerFaceUseCase.execute({
        userId,
        imageBuffers,
        updateIfExists,
        actorId: userId,
        requestId: req.requestId,
        ipAddress: req.ip,
        userAgent: req.get('User-Agent') || null
      });

      return sendResponse(res, 200, ApiResponse.success(result, result.message));
    } catch (error: unknown) {
      console.error('[FaceController] registerFace error:', error);
      const err = toErrorWithStatus(error);
      const statusCode = err.statusCode || 500;
      const errorData = err.details?.errorCode ? { errorCode: err.details.errorCode } : undefined;
      return sendResponse(res, statusCode, ApiResponse.error(err.message || 'Lỗi đăng ký khuôn mặt', statusCode, errorData));
    }
  }

  // ========================
  // ATTENDANCE ENDPOINTS
  // ========================

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

      const locationInput = {
        latitude: req.body?.latitude ?? req.body?.gps_latitude ?? null,
        longitude: req.body?.longitude ?? req.body?.gps_longitude ?? null,
        accuracy: req.body?.accuracy ?? req.body?.gps_accuracy ?? null
      };

      const result = await this.faceAttendanceUseCase.execute({
        userId,
        activityId,
        imageBuffer: file.buffer,
        location: locationInput,
        actorId: userId,
        requestId: req.requestId,
        ipAddress: req.ip,
        userAgent: req.get('User-Agent') || null
      });

      return sendResponse(res, 200, ApiResponse.success(result, result.message));
    } catch (error: unknown) {
      console.error('[FaceController] faceAttendance error:', error);
      const err = toErrorWithStatus(error);
      const statusCode = err.statusCode || 500;
      let errorCode = 'UNKNOWN';
      const msg = err.message || '';
      if (msg.includes('chưa đăng ký khuôn mặt')) errorCode = 'NO_REGISTRATION';
      else if (msg.includes('chưa được xác minh')) errorCode = 'NOT_VERIFIED';
      else if (msg.includes('không khớp')) errorCode = 'MISMATCH';
      else if (msg.includes('không tìm thấy khuôn mặt') || msg.includes('Không thể nhận diện')) errorCode = 'NO_FACE';
      else if (msg.includes('liveness')) errorCode = 'LIVENESS_FAIL';
      else if (msg.includes('nhiều khuôn mặt')) errorCode = 'MULTI_FACE';
      else if (msg.includes('ngoài khu vực') || msg.includes('GPS')) errorCode = 'GEOFENCE_FAIL';
      else if (err.details?.errorCode) errorCode = err.details.errorCode;

      return sendResponse(res, statusCode, ApiResponse.error(err.message || 'Lỗi điểm danh', statusCode, { errorCode }));
    }
  }

  async monitorBulkFaceAttendance(req: AuthenticatedRequest, res: Response): Promise<Response> {
    try {
      const userId = req.user?.sub;
      if (!userId) {
        return sendResponse(res, 401, ApiResponse.error('Chưa đăng nhập', 401));
      }

      const monitorClassId = req.classMonitor?.lop_id;
      if (!monitorClassId) {
        return sendResponse(res, 403, ApiResponse.error('Không xác định được lớp của lớp trưởng', 403));
      }

      const { activityId } = req.params;
      if (!activityId) {
        return sendResponse(res, 400, ApiResponse.error('Thiếu ID hoạt động', 400));
      }

      const multerFiles = req.files as Express.Multer.File[] | undefined;
      const imageBuffers = Array.isArray(multerFiles) ? multerFiles.map(file => file.buffer) : [];
      if (imageBuffers.length === 0) {
        return sendResponse(res, 400, ApiResponse.error('Vui lòng upload ít nhất 1 ảnh khuôn mặt', 400));
      }

      const result = await this.monitorBulkFaceAttendanceUseCase.execute({
        monitorUserId: userId,
        monitorClassId,
        activityId,
        imageBuffers,
        actorId: userId,
        requestId: req.requestId,
        ipAddress: req.ip,
        userAgent: req.get('User-Agent') || null
      });

      return sendResponse(res, 200, ApiResponse.success(result, 'Xử lý điểm danh khuôn mặt hoàn tất'));
    } catch (error: unknown) {
      console.error('[FaceController] monitorBulkFaceAttendance error:', error);
      const err = toErrorWithStatus(error);
      const statusCode = err.statusCode || 500;
      return sendResponse(res, statusCode, ApiResponse.error(err.message || 'Lỗi điểm danh khuôn mặt hàng loạt', statusCode));
    }
  }

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

      const faceData = await this.faceDataRepository.findBySinhVienId(sinhVien.id);
      if (!faceData) {
        return sendResponse(res, 404, ApiResponse.error('Chưa đăng ký khuôn mặt', 404));
      }

      await this.faceDataRepository.delete(faceData.id, {
        actorId: userId,
        requestId: req.requestId,
        ipAddress: req.ip,
        userAgent: req.get('User-Agent') || null
      });

      return sendResponse(res, 200, ApiResponse.success({ deleted: true }, 'Đã xóa dữ liệu khuôn mặt'));
    } catch (error: unknown) {
      console.error('[FaceController] deleteFaceData error:', error);
      const err = toErrorWithStatus(error);
      const statusCode = err.statusCode || 500;
      return sendResponse(res, statusCode, ApiResponse.error(err.message || 'Lỗi xóa dữ liệu', statusCode));
    }
  }

  // ========================
  // ADMIN / TEACHER ENDPOINTS
  // ========================

  async adminListRegistrations(req: AuthenticatedRequest, res: Response): Promise<Response> {
    try {
      const status = (req.query.status as string) || 'all';
      const classId = req.query.classId as string | undefined;
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 20;

      const result = await adminListFaceRegistrationsUseCase.execute({ status: status as any, classId, page, limit });
      return sendResponse(res, 200, ApiResponse.success(result, 'Danh sách đăng ký khuôn mặt'));
    } catch (error: unknown) {
      const err = toErrorWithStatus(error);
      const statusCode = err.statusCode || 500;
      return sendResponse(res, statusCode, ApiResponse.error(err.message, statusCode));
    }
  }

  async adminVerifyFace(req: AuthenticatedRequest, res: Response): Promise<Response> {
    try {
      const { faceDataId } = req.params;
      const userId = req.user?.sub;
      const userRole = req.user?.role || '';

      const result = await adminVerifyFaceUseCase.execute({
        faceDataId,
        userRole,
        actorId: userId,
        requestId: req.requestId,
        ipAddress: req.ip,
        userAgent: req.get('User-Agent') || null
      });
      return sendResponse(res, 200, ApiResponse.success(result, result.message));
    } catch (error: unknown) {
      const err = toErrorWithStatus(error);
      const statusCode = err.statusCode || 500;
      return sendResponse(res, statusCode, ApiResponse.error(err.message, statusCode));
    }
  }

  async adminRejectFace(req: AuthenticatedRequest, res: Response): Promise<Response> {
    try {
      const { faceDataId } = req.params;
      const userId = req.user?.sub;
      const userRole = req.user?.role || '';
      const reason = req.body?.reason;

      const result = await adminRejectFaceUseCase.execute({
        faceDataId,
        userRole,
        reason,
        actorId: userId,
        requestId: req.requestId,
        ipAddress: req.ip,
        userAgent: req.get('User-Agent') || null
      });
      return sendResponse(res, 200, ApiResponse.success(result, result.message));
    } catch (error: unknown) {
      const err = toErrorWithStatus(error);
      const statusCode = err.statusCode || 500;
      return sendResponse(res, statusCode, ApiResponse.error(err.message, statusCode));
    }
  }

  // ========================
  // FALLBACK ENDPOINT
  // ========================

  async createFallbackRequest(req: AuthenticatedRequest, res: Response): Promise<Response> {
    try {
      const userId = req.user?.sub;
      if (!userId) {
        return sendResponse(res, 401, ApiResponse.error('Chưa đăng nhập', 401));
      }

      const { activityId } = req.params;
      if (!activityId) {
        return sendResponse(res, 400, ApiResponse.error('Thiếu ID hoạt động', 400));
      }

      const reason = req.body?.reason || 'Điểm danh khuôn mặt thất bại';
      const errorCode = req.body?.errorCode;
      const similarity = req.body?.similarity;

      const sinhVien = await prisma.sinhVien.findUnique({
        where: { nguoi_dung_id: userId },
        select: { id: true }
      });

      if (!sinhVien) {
        return sendResponse(res, 403, ApiResponse.error('Chỉ sinh viên mới có thể tạo yêu cầu', 403));
      }

      const existingRequest = await prisma.yeuCauDiemDanhThuCong.findUnique({
        where: { sv_id_hd_id: { sv_id: sinhVien.id, hd_id: activityId } }
      });

      if (existingRequest) {
        return sendResponse(res, 409, ApiResponse.error('Bạn đã gửi yêu cầu xác minh cho hoạt động này rồi', 409));
      }

      const existingAttendance = await prisma.diemDanh.findUnique({
        where: { sv_id_hd_id: { sv_id: sinhVien.id, hd_id: activityId } }
      });

      if (existingAttendance) {
        return sendResponse(res, 409, ApiResponse.error('Bạn đã điểm danh hoạt động này rồi', 409));
      }

      const fullReason = `[Face Fallback] ${reason}${errorCode ? ` (${errorCode})` : ''}${similarity ? ` - Similarity: ${similarity}` : ''}`;

      const latitude = req.body?.latitude ? parseFloat(req.body.latitude) : null;
      const longitude = req.body?.longitude ? parseFloat(req.body.longitude) : null;
      const accuracy = req.body?.accuracy ? parseFloat(req.body.accuracy) : null;

      const request = await prisma.yeuCauDiemDanhThuCong.create({
        data: {
          sv_id: sinhVien.id,
          hd_id: activityId,
          ly_do: fullReason,
          minh_chung: [],
          gps_latitude: latitude,
          gps_longitude: longitude,
          gps_accuracy_m: accuracy,
          dia_chi_ip: req.ip,
          user_agent: req.get('User-Agent') || null,
          trang_thai: 'cho_duyet'
        }
      });

      return sendResponse(res, 201, ApiResponse.success(
        { requestId: request.id, status: 'cho_duyet' },
        'Đã gửi yêu cầu xác minh điểm danh. Vui lòng chờ giảng viên hoặc lớp trưởng duyệt.'
      ));
    } catch (error: unknown) {
      console.error('[FaceController] createFallbackRequest error:', error);
      const err = toErrorWithStatus(error);
      const statusCode = err.statusCode || 500;
      return sendResponse(res, statusCode, ApiResponse.error(err.message || 'Lỗi tạo yêu cầu', statusCode));
    }
  }
}

export const faceRecognitionController = new FaceRecognitionController();
export default FaceRecognitionController;
