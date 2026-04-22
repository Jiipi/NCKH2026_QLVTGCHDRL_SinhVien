/**
 * GetActivityQRDataUseCase
 * Use case for getting QR data for activity
 * Follows Single Responsibility Principle (SRP)
 */

import { NotFoundError } from '../../../../core/errors/AppError';
import crypto from 'crypto';
import type { HoatDong, Prisma } from '@prisma/client';
import type IActivityRepository from '../interfaces/IActivityRepository';

/**
 * User context for authentication
 */
interface AuthUser {
  sub?: string;
  role?: string;
  [key: string]: unknown;
}

/**
 * Scope filter for activities
 */
interface ActivityScope {
  [key: string]: unknown;
}

/**
 * QR data result
 */
interface QRDataResult {
  activity_id: string;
  activity_name: string;
  qr_token: string;
  qr_json: string;
}

/**
 * Activity with QR field
 */
type ActivityWithQR = HoatDong & {
  qr?: string | null;
  qr_token?: string | null;
};

/**
 * GetActivityQRDataUseCase
 */
class GetActivityQRDataUseCase {
  private activityRepository: IActivityRepository;

  constructor(activityRepository: IActivityRepository) {
    this.activityRepository = activityRepository;
  }

  /**
   * Generate QR token using crypto
   * Note: DB field is VarChar(32), but hex string of 32 bytes = 64 chars
   * So we use 16 bytes (32 hex chars) to fit the DB constraint
   */
  generateQRToken(): string {
    return crypto.randomBytes(16).toString('hex'); // 16 bytes = 32 hex characters
  }

  async execute(id: string, scope?: ActivityScope, user?: AuthUser, semesterInfo?: { hoc_ky: string; nam_hoc: string }): Promise<QRDataResult> {
    // Không dùng scope filter ở đây vì cần lấy activity theo ID cụ thể
    // Scope filter sẽ được apply ở middleware nếu cần
    // DO NOT filter by semester - students should access QR for activities they registered for
    let activity = await this.activityRepository.findById(id, {}, null, undefined) as ActivityWithQR | null;

    if (!activity) {
      throw new NotFoundError('Hoạt động không tồn tại');
    }

    let qrToken = activity.qr || activity.qr_token;

    // If no QR token exists, generate one and update activity
    if (!qrToken) {
      qrToken = this.generateQRToken();
      try {
        // Update activity with new QR token (DB constraint: VarChar(32))
        // Token is 16 bytes hex = 32 characters, fits DB constraint
        activity = await this.activityRepository.update(id, { qr: qrToken } as Prisma.HoatDongUpdateInput) as ActivityWithQR;
        qrToken = activity.qr || qrToken;
      } catch (error) {
        console.error('[GetActivityQRData] Error updating QR token:', (error as Error).message);
        // Nếu update thất bại, thử lấy lại activity để xem có QR token mới không
        activity = await this.activityRepository.findById(id, {}, null, undefined) as ActivityWithQR | null;
        qrToken = activity?.qr || qrToken;
      }

      if (!qrToken) {
        throw new Error('Không thể tạo mã QR cho hoạt động');
      }
    }

    // Đảm bảo token là string và trim
    // Nếu token cũ dài hơn 32 chars (do DB truncate), chỉ lấy 32 chars đầu
    qrToken = String(qrToken || '').trim();
    if (qrToken.length > 32) {
      console.warn('[GetActivityQRData] Token too long, truncating to 32 chars:', qrToken.length);
      qrToken = qrToken.substring(0, 32);
    }

    // Generate QR JSON data - đảm bảo token trong qr_json khớp với qr_token
    const qrData: QRDataResult = {
      activity_id: activity.id,
      activity_name: activity.ten_hd,
      qr_token: qrToken, // Token đã được normalize
      qr_json: JSON.stringify({
        activityId: activity.id,
        token: qrToken, // Dùng cùng token đã normalize
        timestamp: new Date().toISOString()
      })
    };

    return qrData;
  }
}

export default GetActivityQRDataUseCase;
