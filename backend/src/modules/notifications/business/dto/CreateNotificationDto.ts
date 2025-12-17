import { ValidationError } from '../../../../core/errors/AppError';
import type { ThongBao } from '@prisma/client';

type Priority = 'thap' | 'trung_binh' | 'cao' | 'khan_cap';
type SendMethod = 'trong_he_thong' | 'email' | 'sdt';

interface CreateNotificationData {
  tieu_de: string;
  noi_dung: string;
  loai_tb_id?: string;
  nguoi_nhan_id?: string;
  muc_do_uu_tien?: string;
  phuong_thuc_gui?: string;
  scope?: string;
  activityId?: string;
  hd_id?: string;
}

const PRIORITY_MAP: Record<string, Priority> = {
  binh_thuong: 'trung_binh',
  trung_binh: 'trung_binh',
  thap: 'thap',
  cao: 'cao',
  khan_cap: 'khan_cap'
};

const METHOD_MAP: Record<string, SendMethod> = {
  trong_he_thong: 'trong_he_thong',
  email: 'email',
  sdt: 'sdt'
};

/**
 * CreateNotificationDto
 * Data Transfer Object for creating notifications
 * Follows Single Responsibility Principle (SRP)
 */
class CreateNotificationDto {
  tieu_de: string;
  noi_dung: string;
  loai_tb_id?: string;
  nguoi_nhan_id?: string;
  muc_do_uu_tien: Priority;
  phuong_thuc_gui: SendMethod;
  scope?: string;
  activityId?: string;

  constructor(data: CreateNotificationData) {
    this.tieu_de = data.tieu_de;
    this.noi_dung = data.noi_dung;
    this.loai_tb_id = data.loai_tb_id;
    this.nguoi_nhan_id = data.nguoi_nhan_id;
    this.muc_do_uu_tien = PRIORITY_MAP[String(data.muc_do_uu_tien || '').toLowerCase()] || 'trung_binh';
    this.phuong_thuc_gui = METHOD_MAP[String(data.phuong_thuc_gui || '').toLowerCase()] || 'trong_he_thong';
    this.scope = data.scope;
    this.activityId = data.activityId || data.hd_id;
  }

  validate(): boolean {
    if (!this.tieu_de || !this.noi_dung) {
      throw new ValidationError('Thiếu thông tin bắt buộc');
    }

    this.muc_do_uu_tien = PRIORITY_MAP[String(this.muc_do_uu_tien || '').toLowerCase()] || 'trung_binh';
    this.phuong_thuc_gui = METHOD_MAP[String(this.phuong_thuc_gui || '').toLowerCase()] || 'trong_he_thong';

    if (this.scope === 'single' && !this.nguoi_nhan_id) {
      throw new ValidationError('Thiếu người nhận');
    }

    if (this.scope === 'activity' && !this.activityId) {
      throw new ValidationError('Thiếu ID hoạt động để gửi');
    }

    return true;
  }
}

export default CreateNotificationDto;
module.exports = CreateNotificationDto;
