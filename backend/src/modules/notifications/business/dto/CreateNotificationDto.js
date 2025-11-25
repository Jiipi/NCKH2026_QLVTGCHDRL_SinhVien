const { ValidationError } = require('../../../../core/errors/AppError');

/**
 * CreateNotificationDto
 * Data Transfer Object for creating notifications
 * Follows Single Responsibility Principle (SRP)
 */
class CreateNotificationDto {
  constructor(data) {
    this.tieu_de = data.tieu_de;
    this.noi_dung = data.noi_dung;
    this.loai_tb_id = data.loai_tb_id;
    this.nguoi_nhan_id = data.nguoi_nhan_id;
    this.muc_do_uu_tien = data.muc_do_uu_tien || 'trung_binh';
    this.phuong_thuc_gui = data.phuong_thuc_gui || 'trong_he_thong';
    this.scope = data.scope;
    this.activityId = data.activityId || data.hd_id;
  }

  validate() {
    if (!this.tieu_de || !this.noi_dung) {
      throw new ValidationError('Thiếu thông tin bắt buộc');
    }

    const PRIORITY_MAP = {
      binh_thuong: 'trung_binh',
      trung_binh: 'trung_binh',
      thap: 'thap',
      cao: 'cao',
      khan_cap: 'khan_cap'
    };
    const METHOD_MAP = {
      trong_he_thong: 'trong_he_thong',
      email: 'email',
      sdt: 'sdt'
    };

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

module.exports = CreateNotificationDto;

