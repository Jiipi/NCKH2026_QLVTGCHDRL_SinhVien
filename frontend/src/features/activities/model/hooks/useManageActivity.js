import { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import activitiesApi from '../../services/activitiesApi';
import { useNotification } from '../../../../shared/contexts/NotificationContext';
import useSemesterData, { getGlobalSemester } from '../../../../shared/hooks/useSemesterData';
import { buildSemesterValue, parseSemesterString, isSameSemester } from '../../../../shared/lib/semester';

const getDefaultSemester = () => {
  const m = new Date().getMonth() + 1;
  if (m >= 7 && m <= 11) return 'hoc_ky_1';
  return 'hoc_ky_2';
};

/**
 * Lấy năm học mặc định - chỉ trả về năm đơn (2025, không phải 2025-2026)
 * HK1: năm hiện tại (tháng 7-12)
 * HK2: năm hiện tại (tháng 1-6)
 */
const getDefaultYear = () => {
  const today = new Date();
  const year = today.getFullYear();
  // Trả về năm hiện tại
  return String(year);
};

/**
 * Lấy học kỳ ban đầu từ global storage (đồng bộ với dashboard)
 * Nếu không có thì dùng default
 */
const getInitialSemester = () => {
  const globalSemester = getGlobalSemester();
  if (globalSemester) {
    // Parse global semester (format: hoc_ky_1_2026 or hoc_ky_1-2026)
    const parsed = parseSemesterString(globalSemester);
    if (parsed) {
      return { hoc_ky: parsed.hocKy, nam_hoc: parsed.year };
    }
  }
  // Fallback to default
  return { hoc_ky: getDefaultSemester(), nam_hoc: getDefaultYear() };
};

export function useManageActivity() {
  const { id: activityId } = useParams();
  const navigate = useNavigate();
  const { showSuccess, showError, showWarning } = useNotification();
  const isEditMode = !!activityId;

  // Lấy học kỳ từ global storage (đồng bộ với dashboard)
  const initialSemester = getInitialSemester();

  const [form, setForm] = useState({
    ten_hd: '',
    loai_hd_id: '',
    mo_ta: '',
    ngay_bd: '',
    ngay_kt: '',
    han_dk: '',
    diem_rl: '',
    dia_diem: '',
    sl_toi_da: '',
    nam_hoc: initialSemester.nam_hoc,
    hoc_ky: initialSemester.hoc_ky,
  });
  const [activityTypes, setActivityTypes] = useState([]);
  const [status, setStatus] = useState({ loading: isEditMode, submitting: false });
  const [fieldErrors, setFieldErrors] = useState({});
  // Semester options from backend (for filter consistency)
  const { options: semesterOptions, currentSemester } = useSemesterData();

  // Compute dropdown value format: hoc_ky_1_2025 or hoc_ky_2_2025
  const getCurrentSemesterValue = useCallback(() => {
    const hocKy = form.hoc_ky; // hoc_ky_1 or hoc_ky_2
    const namHoc = form.nam_hoc; // e.g., "2025" (năm đơn)
    if (!hocKy || !namHoc) return '';
    const hk = hocKy.replace('hoc_ky_', '');
    return buildSemesterValue(hk, namHoc);
  }, [form.hoc_ky, form.nam_hoc]);

  // isWritable: Chỉ cho phép tạo/sửa nếu học kỳ đang chọn trùng với học kỳ đang kích hoạt
  const isWritable = useMemo(() => {
    const selectedSemester = getCurrentSemesterValue();
    if (!selectedSemester) return true; // Cho phép nếu chưa chọn học kỳ
    if (!currentSemester) return false; // Không cho phép nếu không có học kỳ kích hoạt
    return isSameSemester(selectedSemester, currentSemester);
  }, [getCurrentSemesterValue, currentSemester]);

  useEffect(() => {
    const fetchActivityTypes = async () => {
      const result = await activitiesApi.getActivityTypes();
      if (result.success) {
        setActivityTypes(result.data);
      }
    };
    fetchActivityTypes();
  }, []);

  useEffect(() => {
    if (!isEditMode) return;

    const fetchActivityDetails = async () => {
      setStatus(s => ({ ...s, loading: true }));
      const result = await activitiesApi.getActivityDetails(activityId);
      if (result.success) {
        const d = result.data;
        const pad = (value) => {
          if (!value) return '';
          try {
            const dt = new Date(value);
            return dt.toISOString().substring(0, 16);
          } catch (e) { return ''; }
        };
        setForm({
          ten_hd: d.ten_hd || '',
          loai_hd_id: d.loai_hd_id || '',
          mo_ta: d.mo_ta || '',
          ngay_bd: pad(d.ngay_bd),
          ngay_kt: pad(d.ngay_kt),
          han_dk: pad(d.han_dk),
          diem_rl: d.diem_rl?.toString() || '',
          dia_diem: d.dia_diem || '',
          sl_toi_da: d.sl_toi_da?.toString() || '',
          nam_hoc: d.nam_hoc || getDefaultYear(),
          hoc_ky: d.hoc_ky || getDefaultSemester(),
        });
      } else {
        showError('Không thể tải chi tiết hoạt động.');
      }
      setStatus(s => ({ ...s, loading: false }));
    };

    fetchActivityDetails();
  }, [activityId, isEditMode, showError]);

  const handleFormChange = useCallback((e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
    if (fieldErrors[name]) {
      setFieldErrors(prev => { const next = { ...prev }; delete next[name]; return next; });
    }
  }, [fieldErrors]);

  // When semester dropdown changes, derive hoc_ky + nam_hoc (năm đơn)
  const handleSemesterChange = useCallback((e) => {
    const selected = e.target.value; // format hoc_ky_1_YYYY or hoc_ky_1-YYYY
    const parsed = parseSemesterString(selected);
    if (!parsed) return;
    setForm(prev => ({ ...prev, hoc_ky: parsed.hocKy, nam_hoc: parsed.year }));
    setFieldErrors(prev => { const next = { ...prev }; delete next.hoc_ky; delete next.nam_hoc; return next; });
  }, []);

  const validate = () => {
    const errs = {};
    if (!form.ten_hd.trim()) errs.ten_hd = 'Vui lòng nhập tên hoạt động';
    if (!form.loai_hd_id) errs.loai_hd_id = 'Vui lòng chọn loại hoạt động';
    if (!form.ngay_bd) errs.ngay_bd = 'Chọn thời gian bắt đầu';
    if (!form.ngay_kt) errs.ngay_kt = 'Chọn thời gian kết thúc';
    if (form.ngay_bd && form.ngay_kt && new Date(form.ngay_kt) < new Date(form.ngay_bd)) errs.ngay_kt = 'Thời gian kết thúc phải sau bắt đầu';
    const diem = parseFloat(form.diem_rl);
    if (form.diem_rl !== '' && (isNaN(diem) || diem < 0)) errs.diem_rl = 'Điểm không hợp lệ';
    return errs;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Đã bỏ kiểm tra quyền ghi - cho phép tạo/sửa hoạt động cho mọi học kỳ
    
    const errs = validate();
    setFieldErrors(errs);
    if (Object.keys(errs).length > 0) return;

    setStatus(s => ({ ...s, submitting: true }));
    
    const payload = {
      ...form,
      diem_rl: form.diem_rl === '' ? 0 : Number(form.diem_rl),
      sl_toi_da: form.sl_toi_da === '' ? undefined : Number(form.sl_toi_da),
      han_dk: form.han_dk || null,
    };

    const result = isEditMode
      ? await activitiesApi.updateActivity(activityId, payload)
      : await activitiesApi.createActivity(payload);

    if (result.success) {
      showSuccess(isEditMode ? 'Cập nhật hoạt động thành công!' : 'Tạo hoạt động thành công!');
      setTimeout(() => navigate(-1), 1000); // Go back to previous page
    } else {
      showError(result.error);
    }
    setStatus(s => ({ ...s, submitting: false }));
  };

  return {
    isEditMode,
    form,
    activityTypes,
    status,
    fieldErrors,
    handleFormChange,
    handleSubmit,
    semesterOptions,
    currentSemesterValue: getCurrentSemesterValue(),
    handleSemesterChange,
    isWritable,
    currentSemester,
  };
}
