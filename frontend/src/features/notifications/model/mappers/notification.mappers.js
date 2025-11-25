/**
 * Notification mappers (Tầng 2 - Model)
 * Dùng để chuẩn hoá dữ liệu từ backend trước khi dùng trong UI.
 */

export function mapNotificationHistoryItem(raw = {}) {
  return {
    id: raw.id,
    title: raw.title || raw.tieu_de || '',
    message: raw.message || raw.noi_dung || '',
    scope: raw.scope || raw.pham_vi || 'system',
    date: raw.date || raw.ngay_gui || raw.created_at || null,
    recipients: raw.recipients || raw.so_nguoi_nhan || 0,
    recipientsList: raw.recipientsList || raw.danh_sach_nguoi_nhan || [],
    roles: raw.roles || raw.vai_tro || [],
    classes: raw.classes || raw.lop || [],
    senderName: raw.senderName || raw.nguoi_gui || '',
    senderRole: raw.senderRole || raw.vai_tro_nguoi_gui || '',
    activity: raw.activity || raw.hoat_dong || null,
  };
}

export function mapNotificationHistory(collection = []) {
  return Array.isArray(collection) ? collection.map(mapNotificationHistoryItem) : [];
}

