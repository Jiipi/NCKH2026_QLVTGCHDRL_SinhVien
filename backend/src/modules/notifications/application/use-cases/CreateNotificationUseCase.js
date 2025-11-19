const CreateNotificationDto = require('../dto/CreateNotificationDto');
const { ValidationError } = require('../../../../core/errors/AppError');

/**
 * CreateNotificationUseCase
 * Use case for creating notifications
 * Follows Single Responsibility Principle (SRP)
 */
class CreateNotificationUseCase {
  constructor(notificationRepository) {
    this.notificationRepository = notificationRepository;
  }

  async _createClassNotification(userId, title, message, loaiTbId, priority, method) {
    let classIds = await this.notificationRepository.getStudentClassIds(userId);

    if (classIds.length === 0) {
      classIds = await this.notificationRepository.getTeacherClassIds(userId);
    }

    if (classIds.length === 0) {
      throw new ValidationError('Không xác định được lớp để gửi thông báo');
    }

    const recipientIds = await this.notificationRepository.getStudentsByClassIds(classIds);

    if (recipientIds.length === 0) {
      return { count: 0, message: 'Không có người nhận trong lớp' };
    }

    const enhancedMessage = `${message}\n\n[Phạm vi: class]`;

    const dataRows = recipientIds.map(rid => ({
      tieu_de: title,
      noi_dung: enhancedMessage,
      loai_tb_id: loaiTbId,
      nguoi_gui_id: userId,
      nguoi_nhan_id: rid,
      muc_do_uu_tien: priority,
      phuong_thuc_gui: method
    }));

    const result = await this.notificationRepository.createMany(dataRows);

    return {
      count: result.count,
      scope: 'class',
      message: 'Đã gửi thông báo tới lớp'
    };
  }

  async _createActivityNotification(userId, activityId, title, message, loaiTbId, priority, method) {
    const activity = await this.notificationRepository.findActivity({ id: activityId });
    const recipientIds = await this.notificationRepository.getActivityParticipants(activityId);

    if (recipientIds.length === 0) {
      return { count: 0, message: 'Không có người nhận theo hoạt động' };
    }

    const enhancedMessage = `${message}\n\n[Phạm vi: activity | hd_id: ${activityId}${activity ? ' | ' + activity.ten_hd : ''}]`;

    const dataRows = recipientIds.map(rid => ({
      tieu_de: title,
      noi_dung: enhancedMessage,
      loai_tb_id: loaiTbId,
      nguoi_gui_id: userId,
      nguoi_nhan_id: rid,
      muc_do_uu_tien: priority,
      phuong_thuc_gui: method
    }));

    const result = await this.notificationRepository.createMany(dataRows);

    return {
      count: result.count,
      scope: 'activity',
      activityId,
      activityName: activity?.ten_hd,
      message: 'Đã gửi thông báo theo hoạt động'
    };
  }

  async execute(data, userId) {
    if (!userId) {
      throw new ValidationError('Không xác định được người gửi');
    }

    const dto = new CreateNotificationDto(data);
    dto.validate();

    const loaiThongBao = await this.notificationRepository.getOrCreateNotificationType(dto.loai_tb_id);

    if (String(dto.scope || '').toLowerCase() === 'class') {
      return await this._createClassNotification(
        userId,
        dto.tieu_de,
        dto.noi_dung,
        loaiThongBao.id,
        dto.muc_do_uu_tien,
        dto.phuong_thuc_gui
      );
    }

    if (String(dto.scope || '').toLowerCase() === 'activity') {
      return await this._createActivityNotification(
        userId,
        dto.activityId,
        dto.tieu_de,
        dto.noi_dung,
        loaiThongBao.id,
        dto.muc_do_uu_tien,
        dto.phuong_thuc_gui
      );
    }

    const enhancedMessage = `${dto.noi_dung}\n\n[Phạm vi: single]`;

    const notification = await this.notificationRepository.create({
      tieu_de: dto.tieu_de,
      noi_dung: enhancedMessage,
      loai_tb_id: loaiThongBao.id,
      nguoi_gui_id: userId,
      nguoi_nhan_id: dto.nguoi_nhan_id,
      muc_do_uu_tien: dto.muc_do_uu_tien,
      phuong_thuc_gui: dto.phuong_thuc_gui
    });

    return { notification, message: 'Tạo thông báo thành công' };
  }
}

module.exports = CreateNotificationUseCase;

