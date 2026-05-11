import type { FC, ChangeEvent, FormEvent, ReactNode } from 'react';
import { LabeledInput } from '../../../../shared/components/forms/LabeledInput';

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
}

interface Status {
  submitting: boolean;
  loading?: boolean;
}

interface ActivityFormProps {
  form: FormData;
  activityTypes: ActivityType[];
  onFormChange: (e: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => void;
  onSubmit: (e: FormEvent<HTMLFormElement>) => void;
  fieldErrors: FieldErrors;
  status: Status;
  isEditMode: boolean;
  semesterOptions?: SemesterOption[];
  currentSemesterValue?: string;
  onSemesterChange?: (e: ChangeEvent<HTMLSelectElement>) => void;
  disabled?: boolean;
}

export const ActivityForm: FC<ActivityFormProps> = ({
  form,
  activityTypes,
  onFormChange,
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
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition((position) => {
      onFormChange({ target: { name: 'geo_latitude', value: String(position.coords.latitude), type: 'text' } } as ChangeEvent<HTMLInputElement>);
      onFormChange({ target: { name: 'geo_longitude', value: String(position.coords.longitude), type: 'text' } } as ChangeEvent<HTMLInputElement>);
    }, undefined, { enableHighAccuracy: true, timeout: 10000, maximumAge: 30000 });
  };

  return (
    <form onSubmit={onSubmit} className="grid grid-cols-2 gap-4">
      {/* Tên & Loại */}
      <LabeledInput id="ten_hd" label="Tên hoạt động" error={fieldErrors.ten_hd} className="col-span-2 md:col-span-1">
        <input 
          id="ten_hd" 
          type="text"
          name="ten_hd" 
          value={form.ten_hd} 
          onChange={onFormChange}
          maxLength={200}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" 
          placeholder="Ví dụ: Hiến máu nhân đạo"
          disabled={disabled}
        />
      </LabeledInput>
      
      {/* Học kỳ - Năm (gộp) */}
      <LabeledInput id="hoc_ky" label="Học kỳ - Năm" error={fieldErrors.hoc_ky || fieldErrors.nam_hoc} className="col-span-2 md:col-span-1">
        <select
          id="hoc_ky"
          name="hoc_ky"
          value={currentSemesterValue}
          onChange={onSemesterChange || onFormChange}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          disabled={disabled}
        >
          {(Array.isArray(semesterOptions) ? semesterOptions : []).map(opt => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
      </LabeledInput>

      <LabeledInput id="loai_hd_id" label="Loại hoạt động" error={fieldErrors.loai_hd_id} className="col-span-2 md:col-span-1">
        <select 
          id="loai_hd_id" 
          name="loai_hd_id" 
          value={form.loai_hd_id} 
          onChange={onFormChange} 
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          disabled={disabled}
        >
          <option value="">Chọn loại hoạt động</option>
          {(Array.isArray(activityTypes) ? activityTypes : []).map(t => (
            <option key={t.id} value={t.id}>{t.ten_loai_hd || t.name}</option>
          ))}
        </select>
      </LabeledInput>

      {/* Mô tả */}
      <LabeledInput id="mo_ta" label="Mô tả" error={fieldErrors.mo_ta} className="col-span-2">
        <textarea 
          id="mo_ta" 
          name="mo_ta" 
          value={form.mo_ta} 
          onChange={onFormChange} 
          rows={4} 
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" 
          placeholder="Mục tiêu, nội dung, đối tượng tham gia..."
          disabled={disabled}
        />
      </LabeledInput>

      {/* Thời gian */}
      <LabeledInput id="ngay_bd" label="Bắt đầu" error={fieldErrors.ngay_bd} className="col-span-2 md:col-span-1">
        <input 
          id="ngay_bd" 
          type="datetime-local" 
          name="ngay_bd" 
          value={form.ngay_bd} 
          onChange={onFormChange} 
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          disabled={disabled}
        />
      </LabeledInput>
      
      <LabeledInput id="ngay_kt" label="Kết thúc" error={fieldErrors.ngay_kt} className="col-span-2 md:col-span-1">
        <input 
          id="ngay_kt" 
          type="datetime-local" 
          name="ngay_kt" 
          value={form.ngay_kt} 
          onChange={onFormChange} 
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          disabled={disabled}
        />
      </LabeledInput>
      
      <LabeledInput id="han_dk" label="Hạn đăng ký (tuỳ chọn)" hint="Để trống nếu không giới hạn" error={fieldErrors.han_dk} className="col-span-2 md:col-span-1">
        <input 
          id="han_dk" 
          type="datetime-local" 
          name="han_dk" 
          value={form.han_dk} 
          onChange={onFormChange} 
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          disabled={disabled}
        />
      </LabeledInput>

      {/* Điểm & Số lượng */}
      <LabeledInput id="diem_rl" label="Điểm rèn luyện" error={fieldErrors.diem_rl} className="col-span-2 md:col-span-1">
        <input 
          id="diem_rl" 
          type="number" 
          step="0.5" 
          min="0" 
          name="diem_rl" 
          value={form.diem_rl} 
          onChange={onFormChange}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          disabled={disabled}
        />
      </LabeledInput>

      <LabeledInput id="sl_toi_da" label="Số lượng tối đa" hint="Để trống nếu không giới hạn" error={fieldErrors.sl_toi_da} className="col-span-2 md:col-span-1">
        <input 
          id="sl_toi_da" 
          type="number" 
          min="1" 
          name="sl_toi_da" 
          value={form.sl_toi_da} 
          onChange={onFormChange}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          disabled={disabled}
        />
      </LabeledInput>

      {/* Địa điểm */}
       <LabeledInput id="dia_diem" label="Địa điểm" error={fieldErrors.dia_diem} className="col-span-2">
        <input 
          id="dia_diem" 
          type="text"
          name="dia_diem" 
          value={form.dia_diem} 
          onChange={onFormChange}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" 
          placeholder="Ví dụ: Hội trường A"
          disabled={disabled}
        />
      </LabeledInput>

      <div className="col-span-2 rounded-lg border border-gray-200 p-4 space-y-4">
        <div className="flex items-center gap-3">
          <input
            id="yeu_cau_gps"
            type="checkbox"
            name="yeu_cau_gps"
            checked={form.yeu_cau_gps}
            onChange={onFormChange}
            disabled={disabled}
            className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
          />
          <label htmlFor="yeu_cau_gps" className="font-medium text-gray-800">Yêu cầu vị trí khi điểm danh</label>
        </div>

        {form.yeu_cau_gps && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <LabeledInput id="geo_latitude" label="Vĩ độ" error={fieldErrors.geo_latitude}>
              <input
                id="geo_latitude"
                type="number"
                step="any"
                name="geo_latitude"
                value={form.geo_latitude}
                onChange={onFormChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                disabled={disabled}
              />
            </LabeledInput>
            <LabeledInput id="geo_longitude" label="Kinh độ" error={fieldErrors.geo_longitude}>
              <input
                id="geo_longitude"
                type="number"
                step="any"
                name="geo_longitude"
                value={form.geo_longitude}
                onChange={onFormChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                disabled={disabled}
              />
            </LabeledInput>
            <LabeledInput id="geo_radius_meters" label="Bán kính (m)" error={fieldErrors.geo_radius_meters}>
              <input
                id="geo_radius_meters"
                type="number"
                min="50"
                max="1000"
                name="geo_radius_meters"
                value={form.geo_radius_meters}
                onChange={onFormChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                disabled={disabled}
              />
            </LabeledInput>
            <div className="md:col-span-3 flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={fillCurrentLocation}
                disabled={disabled}
                className="px-3 py-2 rounded-lg bg-gray-100 text-gray-700 hover:bg-gray-200 disabled:opacity-60"
              >
                Dùng vị trí hiện tại
              </button>
              <label className="flex items-center gap-2 text-sm text-gray-700">
                <input
                  type="checkbox"
                  name="cho_phep_fallback"
                  checked={form.cho_phep_fallback}
                  onChange={onFormChange}
                  disabled={disabled}
                  className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                Cho phép yêu cầu điểm danh thủ công khi GPS lỗi
              </label>
            </div>
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="col-span-2 flex items-center justify-end gap-2 pt-2">
        <button 
          type="button" 
          onClick={() => window.history.back()} 
          className="px-4 py-2 rounded-lg bg-gray-100 text-gray-700 hover:bg-gray-200"
          disabled={disabled}
        >
          Hủy
        </button>
        <button 
          type="submit" 
          disabled={status.submitting || disabled}
          className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-60"
        >
          {status.submitting ? (isEditMode ? 'Đang lưu...' : 'Đang tạo...') : (isEditMode ? 'Lưu thay đổi' : 'Tạo hoạt động')}
        </button>
      </div>
    </form>
  );
};

export default ActivityForm;
