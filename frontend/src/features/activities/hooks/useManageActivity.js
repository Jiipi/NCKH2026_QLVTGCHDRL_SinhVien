import { useState, useEffect, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import activitiesApi from '../services/activitiesApi';
import { useNotification } from '../../../contexts/NotificationContext';
import useSemesterData from '../../../hooks/useSemesterData';

const getDefaultSemester = () => {
  const m = new Date().getMonth() + 1;
  if (m >= 7 && m <= 11) return 'hoc_ky_1';
  return 'hoc_ky_2';
};

const getDefaultYearRange = () => {
  const today = new Date();
  const year = today.getFullYear();
  const m = today.getMonth() + 1;
  if (m >= 1 && m <= 6) return `${year - 1}-${year}`;
  return `${year}-${year + 1}`;
};

export function useManageActivity() {
  const { id: activityId } = useParams();
  const navigate = useNavigate();
  const { showSuccess, showError } = useNotification();
  const isEditMode = !!activityId;

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
    nam_hoc: getDefaultYearRange(),
    hoc_ky: getDefaultSemester(),
  });
  const [activityTypes, setActivityTypes] = useState([]);
  const [status, setStatus] = useState({ loading: isEditMode, submitting: false });
  const [fieldErrors, setFieldErrors] = useState({});
  // Semester options from backend (for filter consistency)
  const { options: semesterOptions } = useSemesterData();

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
          nam_hoc: d.nam_hoc || getDefaultYearRange(),
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

  // Compute dropdown value format: hoc_ky_1-2025 or hoc_ky_2-2025
  const getCurrentSemesterValue = useCallback(() => {
    const hocKy = form.hoc_ky; // hoc_ky_1 or hoc_ky_2
    const namHoc = form.nam_hoc; // e.g., 2025-2026
    if (!hocKy || !namHoc) return '';
    const [start, end] = String(namHoc).split('-');
    const year = hocKy === 'hoc_ky_1' ? start : end;
    return `${hocKy}-${year}`;
  }, [form.hoc_ky, form.nam_hoc]);

  // When semester dropdown changes, derive hoc_ky + nam_hoc
  const handleSemesterChange = useCallback((e) => {
    const selected = e.target.value; // format hoc_ky_1-YYYY
    const match = selected && selected.match(/^(hoc_ky_\d+)-(\d{4})$/);
    if (!match) return;
    const hocKy = match[1];
    const year = parseInt(match[2], 10);
    const namHoc = hocKy === 'hoc_ky_1' ? `${year}-${year + 1}` : `${year - 1}-${year}`;
    setForm(prev => ({ ...prev, hoc_ky: hocKy, nam_hoc: namHoc }));
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
    const errs = validate();
    setFieldErrors(errs);
    if (Object.keys(errs).length > 0) return;

    setStatus(s => ({ ...s, submitting: true }));
    
    const payload = {
      ...form,
      diem_rl: form.diem_rl === '' ? 0 : Number(form.diem_rl),
      sl_toi_da: form.sl_toi_da === '' ? null : Number(form.sl_toi_da),
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
  };
}
