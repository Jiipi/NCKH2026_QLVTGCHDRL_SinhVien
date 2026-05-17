import type { FC, ChangeEvent, FormEvent } from 'react';
import { CalendarDays, Clock, Crosshair, FileText, Image as ImageIcon, Loader2, LocateFixed, MapPin, Paperclip, Save, Tag, Trophy, Users, X } from 'lucide-react';
import { LabeledInput } from '../../../../shared/components/forms/LabeledInput';
import FileUpload from '../../../../shared/ui/FileUpload/FileUpload';

interface ActivityType {
  id: string;
  ten_loai_hd?: string;
  name?: string;
}

interface SemesterOption {
  value: string;
  label: string;
}

interface FormData {
  ten_hd: string;
  loai_hd_id: string;
  mo_ta: string;
  ngay_bd: string;
  ngay_kt: string;
  han_dk: string;
  diem_rl: number | string;
  sl_toi_da: number | string;
  dia_diem: string;
  yeu_cau_gps: boolean;
  cho_phep_fallback: boolean;
  geo_latitude: string;
  geo_longitude: string;
  geo_radius_meters: string;
  hinh_anh: string[];
  tep_dinh_kem: string[];
}

interface FieldErrors {
  ten_hd?: string;
  loai_hd_id?: string;
  hoc_ky?: string;
  nam_hoc?: string;
  mo_ta?: string;
  ngay_bd?: string;
  ngay_kt?: string;
  han_dk?: string;
  diem_rl?: string;
  sl_toi_da?: string;
  dia_diem?: string;
  geo_latitude?: string;
  geo_longitude?: string;
  geo_radius_meters?: string;
  hinh_anh?: string;
  tep_dinh_kem?: string;
}

interface Status {
  submitting: boolean;
  loading?: boolean;
}

interface ActivityFormProps {
  form: FormData;
  activityTypes: ActivityType[];
  onFormChange: (e: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => void;
  onArrayFieldChange: (field: 'hinh_anh' | 'tep_dinh_kem', urls: string[]) => void;
  onSubmit: (e: FormEvent<HTMLFormElement>) => void;
  fieldErrors: FieldErrors;
  status: Status;
  isEditMode: boolean;
  semesterOptions?: SemesterOption[];
  currentSemesterValue?: string;
  onSemesterChange?: (e: ChangeEvent<HTMLSelectElement>) => void;
  disabled?: boolean;
}

const controlClass = 'w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100 disabled:cursor-not-allowed disabled:bg-slate-50 disabled:text-slate-500';
const iconClass = 'pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400';
const withIconClass = `${controlClass} pl-10`;

export const ActivityForm: FC<ActivityFormProps> = ({
  form,
  activityTypes,
  onFormChange,
  onArrayFieldChange,
  onSubmit,
  fieldErrors,
  status,
  isEditMode,
  semesterOptions = [],
  currentSemesterValue = '',
  onSemesterChange,
  disabled,
}: ActivityFormProps) => {
  const fillCurrentLocation = () => {
    if (!navigator.geolocation || disabled) return;
    navigator.geolocation.getCurrentPosition((position) => {
      onFormChange({ target: { name: 'geo_latitude', value: String(position.coords.latitude), type: 'text' } } as ChangeEvent<HTMLInputElement>);
      onFormChange({ target: { name: 'geo_longitude', value: String(position.coords.longitude), type: 'text' } } as ChangeEvent<HTMLInputElement>);
    }, undefined, { enableHighAccuracy: true, timeout: 10000, maximumAge: 30000 });
  };

  return (
    <form onSubmit={onSubmit} className="grid grid-cols-1 gap-4 lg:grid-cols-2">
      <LabeledInput id="ten_hd" label="Tên hoạt động" error={fieldErrors.ten_hd}>
        <div className="relative">
          <FileText className={iconClass} />
          <input
            id="ten_hd"
            type="text"
            name="ten_hd"
            value={form.ten_hd}
            onChange={onFormChange}
            maxLength={200}
            className={withIconClass}
            placeholder="Ví dụ: Ngày hội Khoa học - CNTT2026"
            disabled={disabled}
          />
        </div>
      </LabeledInput>

      <LabeledInput id="hoc_ky" label="Học kỳ - Năm" error={fieldErrors.hoc_ky || fieldErrors.nam_hoc}>
        <div className="relative">
          <CalendarDays className={iconClass} />
          <select
            id="hoc_ky"
            name="hoc_ky"
            value={currentSemesterValue}
            onChange={onSemesterChange || onFormChange}
            className={withIconClass}
            disabled={disabled}
          >
            {(Array.isArray(semesterOptions) ? semesterOptions : []).map(opt => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        </div>
      </LabeledInput>

      <LabeledInput id="loai_hd_id" label="Loại hoạt động" error={fieldErrors.loai_hd_id}>
        <div className="relative">
          <Tag className={iconClass} />
          <select
            id="loai_hd_id"
            name="loai_hd_id"
            value={form.loai_hd_id}
            onChange={onFormChange}
            className={withIconClass}
            disabled={disabled}
          >
            <option value="">Chọn loại hoạt động</option>
            {(Array.isArray(activityTypes) ? activityTypes : []).map(t => (
              <option key={t.id} value={t.id}>{t.ten_loai_hd || t.name}</option>
            ))}
          </select>
        </div>
      </LabeledInput>

      <LabeledInput id="dia_diem" label="Địa điểm" error={fieldErrors.dia_diem}>
        <div className="relative">
          <MapPin className={iconClass} />
          <input
            id="dia_diem"
            type="text"
            name="dia_diem"
            value={form.dia_diem}
            onChange={onFormChange}
            className={withIconClass}
            placeholder="Ví dụ: Hội trường A"
            disabled={disabled}
          />
        </div>
      </LabeledInput>

      <LabeledInput id="mo_ta" label="Mô tả" error={fieldErrors.mo_ta} className="lg:col-span-2">
        <textarea
          id="mo_ta"
          name="mo_ta"
          value={form.mo_ta}
          onChange={onFormChange}
          rows={4}
          className={controlClass}
          placeholder="Mục tiêu, nội dung, đối tượng tham gia..."
          disabled={disabled}
        />
      </LabeledInput>

      <LabeledInput id="ngay_bd" label="Bắt đầu" error={fieldErrors.ngay_bd}>
        <div className="relative">
          <Clock className={iconClass} />
          <input id="ngay_bd" type="datetime-local" name="ngay_bd" value={form.ngay_bd} onChange={onFormChange} className={withIconClass} disabled={disabled} />
        </div>
      </LabeledInput>

      <LabeledInput id="ngay_kt" label="Kết thúc" error={fieldErrors.ngay_kt}>
        <div className="relative">
          <Clock className={iconClass} />
          <input id="ngay_kt" type="datetime-local" name="ngay_kt" value={form.ngay_kt} onChange={onFormChange} className={withIconClass} disabled={disabled} />
        </div>
      </LabeledInput>

      <LabeledInput id="han_dk" label="Hạn đăng ký" hint="Để trống nếu không giới hạn" error={fieldErrors.han_dk}>
        <div className="relative">
          <CalendarDays className={iconClass} />
          <input id="han_dk" type="datetime-local" name="han_dk" value={form.han_dk} onChange={onFormChange} className={withIconClass} disabled={disabled} />
        </div>
      </LabeledInput>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <LabeledInput id="diem_rl" label="Điểm rèn luyện" error={fieldErrors.diem_rl}>
          <div className="relative">
            <Trophy className={iconClass} />
            <input id="diem_rl" type="number" step="1" min="0" max="100" name="diem_rl" value={form.diem_rl} onChange={onFormChange} className={withIconClass} disabled={disabled} />
          </div>
        </LabeledInput>

        <LabeledInput id="sl_toi_da" label="Số lượng tối đa" hint="Để trống nếu không giới hạn" error={fieldErrors.sl_toi_da}>
          <div className="relative">
            <Users className={iconClass} />
            <input id="sl_toi_da" type="number" min="1" name="sl_toi_da" value={form.sl_toi_da} onChange={onFormChange} className={withIconClass} disabled={disabled} />
          </div>
        </LabeledInput>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-slate-50/70 p-4 lg:col-span-2">
        <label htmlFor="yeu_cau_gps" className="flex cursor-pointer items-center gap-3">
          <input
            id="yeu_cau_gps"
            type="checkbox"
            name="yeu_cau_gps"
            checked={form.yeu_cau_gps}
            onChange={onFormChange}
            disabled={disabled}
            className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
          />
          <span className="flex items-center gap-2 font-semibold text-slate-800">
            <Crosshair className="h-4 w-4 text-blue-600" />
            Yêu cầu vị trí khi điểm danh
          </span>
        </label>

        {form.yeu_cau_gps && (
          <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-3">
            <LabeledInput id="geo_latitude" label="Vĩ độ" error={fieldErrors.geo_latitude}>
              <input id="geo_latitude" type="number" step="any" name="geo_latitude" value={form.geo_latitude} onChange={onFormChange} className={controlClass} disabled={disabled} />
            </LabeledInput>
            <LabeledInput id="geo_longitude" label="Kinh độ" error={fieldErrors.geo_longitude}>
              <input id="geo_longitude" type="number" step="any" name="geo_longitude" value={form.geo_longitude} onChange={onFormChange} className={controlClass} disabled={disabled} />
            </LabeledInput>
            <LabeledInput id="geo_radius_meters" label="Bán kính (m)" error={fieldErrors.geo_radius_meters}>
              <input id="geo_radius_meters" type="number" min="50" max="1000" name="geo_radius_meters" value={form.geo_radius_meters} onChange={onFormChange} className={controlClass} disabled={disabled} />
            </LabeledInput>

            <div className="flex flex-wrap items-center gap-3 md:col-span-3">
              <button
                type="button"
                onClick={fillCurrentLocation}
                disabled={disabled}
                className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
              >
                <LocateFixed className="h-4 w-4" />
                Dùng vị trí hiện tại
              </button>
              <label className="flex items-center gap-2 text-sm text-slate-700">
                <input
                  type="checkbox"
                  name="cho_phep_fallback"
                  checked={form.cho_phep_fallback}
                  onChange={onFormChange}
                  disabled={disabled}
                  className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                />
                Cho phép yêu cầu điểm danh thủ công khi GPS lỗi
              </label>
            </div>
          </div>
        )}
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-4 lg:col-span-2">
        <div className="mb-4 flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-100 text-indigo-600">
            <ImageIcon className="h-4 w-4" />
          </div>
          <div>
            <h3 className="font-bold text-slate-950">Hình ảnh hoạt động</h3>
            <p className="text-xs text-slate-500">Đăng tải ảnh banner hoặc ảnh minh họa cho hoạt động</p>
          </div>
        </div>
        <FileUpload
          type="image"
          multiple
          maxFiles={5}
          value={form.hinh_anh}
          onChange={(urls) => onArrayFieldChange('hinh_anh', urls)}
          disabled={disabled}
        />
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-4 lg:col-span-2">
        <div className="mb-4 flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-100 text-amber-600">
            <Paperclip className="h-4 w-4" />
          </div>
          <div>
            <h3 className="font-bold text-slate-950">Tài liệu đính kèm</h3>
            <p className="text-xs text-slate-500">Đăng tải tài liệu, quy định, thông báo liên quan đến hoạt động</p>
          </div>
        </div>
        <FileUpload
          type="attachment"
          multiple
          maxFiles={10}
          value={form.tep_dinh_kem}
          onChange={(urls) => onArrayFieldChange('tep_dinh_kem', urls)}
          disabled={disabled}
        />
      </div>

      <div className="flex flex-col-reverse gap-3 pt-2 sm:flex-row sm:justify-end lg:col-span-2">
        <button
          type="button"
          onClick={() => window.history.back()}
          className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50"
          disabled={disabled}
        >
          <X className="h-4 w-4" />
          Hủy
        </button>
        <button
          type="submit"
          disabled={status.submitting || disabled}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {status.submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
          {status.submitting ? (isEditMode ? 'Đang lưu...' : 'Đang tạo...') : (isEditMode ? 'Lưu thay đổi' : 'Tạo hoạt động')}
        </button>
      </div>
    </form>
  );
};

export default ActivityForm;
