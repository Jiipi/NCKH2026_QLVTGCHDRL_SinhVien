/**
 * Notification mappers (Tầng 2 - Model)
 * Dùng để chuẩn hoá dữ liệu từ backend trước khi dùng trong UI.
 */

/** Raw notification data from backend API */
export interface RawNotificationHistoryItem {
  id?: string;
  title?: string;
  tieu_de?: string;
  message?: string;
  noi_dung?: string;
  scope?: string;
  pham_vi?: string;
  date?: string | null;
  ngay_gui?: string | null;
  created_at?: string | null;
  recipients?: number;
  so_nguoi_nhan?: number;
  recipientsList?: RecipientInfo[];
  danh_sach_nguoi_nhan?: RecipientInfo[];
  roles?: string[];
  vai_tro?: string[];
  classes?: string[];
  lop?: string[];
  senderName?: string;
  nguoi_gui?: string;
  senderRole?: string;
  vai_tro_nguoi_gui?: string;
  activity?: unknown;
  hoat_dong?: unknown;
}

/** Recipient info object */
export interface RecipientInfo {
  ho_ten?: string;
  email?: string;
  vai_tro?: string;
  lop?: string;
}

/** Mapped notification history item for UI */
export interface NotificationHistoryItem {
  id: string | undefined;
  title: string;
  message: string;
  scope: string;
  date: string | null;
  recipients: number;
  recipientsList: RecipientInfo[];
  roles: string[];
  classes: string[];
  senderName: string;
  senderRole: string;
  activity: unknown;
}

export function mapNotificationHistoryItem(raw: RawNotificationHistoryItem = {}): NotificationHistoryItem {
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

export function mapNotificationHistory(collection: RawNotificationHistoryItem[] = []): NotificationHistoryItem[] {
  return Array.isArray(collection) ? collection.map(mapNotificationHistoryItem) : [];
}

