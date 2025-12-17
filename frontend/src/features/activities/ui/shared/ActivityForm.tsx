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
