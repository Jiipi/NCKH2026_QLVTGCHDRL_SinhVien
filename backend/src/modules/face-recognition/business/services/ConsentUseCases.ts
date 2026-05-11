/**
 * ConsentUseCases
 * =================
 * Use cases cho đồng ý sinh trắc học trước khi đăng ký khuôn mặt
 */

import { ValidationError, NotFoundError } from '../../../../core/errors/AppError';
import type { IFaceDataRepository, FaceAuditContext } from '../interfaces';
import { auditIntegrityService } from '../../../audit-integrity/services/auditIntegrity.service';
import { prisma } from '../../../../data/infrastructure/prisma/client';

// Phiên bản consent hiện tại — tăng khi thay đổi nội dung chính sách
export const CURRENT_CONSENT_VERSION = '1.0';

export const CONSENT_POLICY_TEXT = {
  title: 'Chính sách thu thập dữ liệu sinh trắc học',
  version: CURRENT_CONSENT_VERSION,
  sections: [
    {
      title: 'Dữ liệu thu thập',
      content: 'Hệ thống sẽ thu thập ảnh khuôn mặt và trích xuất vector đặc trưng (embedding) 512 chiều từ khuôn mặt của bạn bằng công nghệ RetinaFace + ArcFace.'
    },
    {
      title: 'Mục đích sử dụng',
      content: 'Dữ liệu sinh trắc học chỉ được sử dụng cho mục đích điểm danh tự động tại các hoạt động rèn luyện trong hệ thống quản lý của trường.'
    },
    {
      title: 'Thời gian lưu trữ',
      content: 'Dữ liệu được lưu trữ trong suốt thời gian bạn là sinh viên của trường. Sau khi tốt nghiệp hoặc theo yêu cầu, dữ liệu sẽ được xóa.'
    },
    {
      title: 'Quyền xóa dữ liệu',
      content: 'Bạn có quyền xóa dữ liệu khuôn mặt bất cứ lúc nào thông qua trang Hồ sơ cá nhân. Sau khi xóa, bạn sẽ không thể sử dụng tính năng điểm danh bằng khuôn mặt.'
    },
    {
      title: 'Phạm vi truy cập',
      content: 'Chỉ hệ thống AI nhận dạng và quản trị viên có quyền truy cập dữ liệu. Dữ liệu không được chia sẻ với bên thứ ba.'
    }
  ]
};

interface ConsentStatusResult {
  hasConsent: boolean;
  currentVersion: string;
  acceptedVersion?: string;
  acceptedAt?: Date;
  needsConsent: boolean;
  policy: typeof CONSENT_POLICY_TEXT;
}

class CheckConsentUseCase {
  async execute(userId: string): Promise<ConsentStatusResult> {
    const sinhVien = await prisma.sinhVien.findUnique({
      where: { nguoi_dung_id: userId },
      select: { id: true }
    });

    if (!sinhVien) {
      throw new NotFoundError('Không tìm thấy thông tin sinh viên');
    }

    const latestConsent = await prisma.dongYSinhTracHoc.findFirst({
      where: {
        sinh_vien_id: sinhVien.id,
        revoked_at: null
      },
      orderBy: { accepted_at: 'desc' }
    });

    const hasValidConsent = latestConsent?.consent_version === CURRENT_CONSENT_VERSION;

    return {
      hasConsent: hasValidConsent,
      currentVersion: CURRENT_CONSENT_VERSION,
      acceptedVersion: latestConsent?.consent_version,
      acceptedAt: latestConsent?.accepted_at,
      needsConsent: !hasValidConsent,
      policy: CONSENT_POLICY_TEXT
    };
  }
}

interface AcceptConsentInput extends FaceAuditContext {
  userId: string;
}

class AcceptConsentUseCase {
  async execute(input: AcceptConsentInput): Promise<{ success: boolean; message: string }> {
    const { userId, requestId, ipAddress, userAgent } = input;

    const sinhVien = await prisma.sinhVien.findUnique({
      where: { nguoi_dung_id: userId },
      select: { id: true }
    });

    if (!sinhVien) {
      throw new NotFoundError('Không tìm thấy thông tin sinh viên');
    }

    // Kiểm tra đã consent version này chưa
    const existing = await prisma.dongYSinhTracHoc.findFirst({
      where: {
        sinh_vien_id: sinhVien.id,
        consent_version: CURRENT_CONSENT_VERSION,
        revoked_at: null
      }
    });

    if (existing) {
      return { success: true, message: 'Bạn đã đồng ý chính sách sinh trắc học.' };
    }

    await prisma.$transaction(async (tx) => {
      const consent = await tx.dongYSinhTracHoc.create({
        data: {
          sinh_vien_id: sinhVien.id,
          consent_version: CURRENT_CONSENT_VERSION,
          ip_address: ipAddress,
          user_agent: userAgent
        }
      });

      await auditIntegrityService.appendEvent(tx, {
        chainScope: 'face-data',
        entityType: 'dong_y_sinh_trac_hoc',
        entityId: consent.id,
        action: 'biometric_consent_accepted',
        actorId: userId,
        requestId: requestId || null,
        ipAddress: ipAddress || null,
        userAgent: userAgent || null,
        payload: {
          consentId: consent.id,
          sinhVienId: sinhVien.id,
          consentVersion: CURRENT_CONSENT_VERSION
        }
      });
    });

    return { success: true, message: 'Đã ghi nhận đồng ý chính sách sinh trắc học.' };
  }
}

export const checkConsentUseCase = new CheckConsentUseCase();
export const acceptConsentUseCase = new AcceptConsentUseCase();
export default { checkConsentUseCase, acceptConsentUseCase };
