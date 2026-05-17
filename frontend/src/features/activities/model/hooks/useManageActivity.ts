/**
 * useManageActivity Hook - TypeScript Version
 * Business Layer - Activity create/edit management
 */

import { useState, useEffect, useCallback, useMemo } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { activityApi, activityTypeApi } from '../../../../shared/api/repositories';
import { useNotification } from '../../../../shared/contexts/NotificationContext';
import useSemesterData, { getGlobalSemester } from '../../../../shared/hooks/useSemesterData';
import { buildSemesterValue, parseSemesterString, isSameSemester } from '../../../../shared/lib/semester';
import { formatDateTimeLocal, toISOWithTimezone } from '../../../../shared/lib/dateTime';
import type { ActivityType } from '../../../../shared/types';

// ============ TYPES ============
export interface ActivityFormData {
    ten_hd: string;
    loai_hd_id: string;
    mo_ta: string;
    ngay_bd: string;
    ngay_kt: string;
    han_dk: string;
    diem_rl: string;
    dia_diem: string;
    sl_toi_da: string;
    nam_hoc: string;
    hoc_ky: string;
    yeu_cau_gps: boolean;
    cho_phep_fallback: boolean;
    geo_latitude: string;
    geo_longitude: string;
    geo_radius_meters: string;
    hinh_anh: string[];
    tep_dinh_kem: string[];
}

export interface FormStatus {
    loading: boolean;
    submitting: boolean;
}

export interface FieldErrors {
    [key: string]: string;
}

export interface UseManageActivityReturn {
    isEditMode: boolean;
    form: ActivityFormData;
    activityTypes: ActivityType[];
    status: FormStatus;
    fieldErrors: FieldErrors;
    handleFormChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => void;
    handleArrayFieldChange: (field: 'hinh_anh' | 'tep_dinh_kem', urls: string[]) => void;
    handleSubmit: (e: React.FormEvent) => Promise<void>;
    semesterOptions: Array<{ value: string; label: string }>;
    currentSemesterValue: string;
    handleSemesterChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
    isWritable: boolean;
    currentSemester: string | null;
}

// ============ HELPERS ============
const getDefaultSemester = (): string => {
    const m = new Date().getMonth() + 1;
    if (m >= 7 && m <= 11) return 'hoc_ky_1';
    return 'hoc_ky_2';
};

const getDefaultYear = (): string => {
    return String(new Date().getFullYear());
};

interface ParsedSemester {
    hocKy: string;
    year: string;
}

const getInitialSemester = (): { hoc_ky: string; nam_hoc: string } => {
    const globalSemester = getGlobalSemester();
    if (globalSemester) {
        const parsed = parseSemesterString(globalSemester) as ParsedSemester | null;
        if (parsed) {
            return { hoc_ky: parsed.hocKy, nam_hoc: parsed.year };
        }
    }
    return { hoc_ky: getDefaultSemester(), nam_hoc: getDefaultYear() };
};

/**
 * useManageActivity - Hook tạo/sửa hoạt động
 */
export function useManageActivity(): UseManageActivityReturn {
    const { id: activityId } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const location = useLocation();
    const { showSuccess, showError } = useNotification();
    const isEditMode = !!activityId;
    const isAdminRoute = location.pathname.startsWith('/admin');
    const isTeacherRoute = location.pathname.startsWith('/teacher');
    const isMonitorRoute = location.pathname.startsWith('/monitor') || location.pathname.startsWith('/class');

    const initialSemester = getInitialSemester();

    const [form, setForm] = useState<ActivityFormData>({
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
        yeu_cau_gps: false,
        cho_phep_fallback: true,
        geo_latitude: '',
        geo_longitude: '',
        geo_radius_meters: '100',
        hinh_anh: [],
        tep_dinh_kem: [],
    });
    const [activityTypes, setActivityTypes] = useState<ActivityType[]>([]);
    const [status, setStatus] = useState<FormStatus>({ loading: isEditMode, submitting: false });
    const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
    const { options: semesterOptions, currentSemester } = useSemesterData();

    const getCurrentSemesterValue = useCallback((): string => {
        const hocKy = form.hoc_ky;
        const namHoc = form.nam_hoc;
        if (!hocKy || !namHoc) return '';
        const hk = hocKy.replace('hoc_ky_', '');
        return buildSemesterValue(hk, namHoc);
    }, [form.hoc_ky, form.nam_hoc]);

    const isWritable = useMemo((): boolean => {
        const selectedSemester = getCurrentSemesterValue();
        if (!selectedSemester) return true;
        if (!currentSemester) return false;
        return isSameSemester(selectedSemester, currentSemester);
    }, [getCurrentSemesterValue, currentSemester]);

    // Fetch activity types
    useEffect(() => {
        const fetchActivityTypes = async (): Promise<void> => {
            try {
                const types = await activityTypeApi.getActivityTypes();
                setActivityTypes(types);
            } catch (err) {
                console.error('Failed to fetch activity types:', err);
            }
        };
        fetchActivityTypes();
    }, []);

    // Fetch activity details for edit mode
    useEffect(() => {
        if (!isEditMode || !activityId) return;

        const fetchActivityDetails = async (): Promise<void> => {
            setStatus(s => ({ ...s, loading: true }));
            try {
                const d = await activityApi.getActivityById(activityId) as any;
                setForm({
                    ten_hd: d.ten_hd || '',
                    loai_hd_id: d.loai_hd_id || d.loai_hoat_dong_id || d.loai_hd?.id || '',
                    mo_ta: d.mo_ta || '',
                    ngay_bd: formatDateTimeLocal(d.ngay_bd),
                    ngay_kt: formatDateTimeLocal(d.ngay_kt),
                    han_dk: formatDateTimeLocal(d.han_dk),
                    diem_rl: (d.diem_rl ?? d.diem_cong ?? d.diem_ren_luyen ?? '').toString(),
                    dia_diem: d.dia_diem || '',
                    sl_toi_da: (d.sl_toi_da ?? d.so_luong_toi_da ?? '').toString(),
                    nam_hoc: d.nam_hoc || getDefaultYear(),
                    hoc_ky: d.hoc_ky?.toString() || getDefaultSemester(),
                    yeu_cau_gps: Boolean(d.yeu_cau_gps),
                    cho_phep_fallback: d.cho_phep_fallback !== false,
                    geo_latitude: d.geo_latitude?.toString() || '',
                    geo_longitude: d.geo_longitude?.toString() || '',
                    geo_radius_meters: d.geo_radius_meters?.toString() || '100',
                    hinh_anh: d.hinh_anh || [],
                    tep_dinh_kem: d.tep_dinh_kem || [],
                });
            } catch (err) {
                showError('Không thể tải chi tiết hoạt động.');
            }
            setStatus(s => ({ ...s, loading: false }));
        };

        fetchActivityDetails();
    }, [activityId, isEditMode, showError]);

    const handleFormChange = useCallback((
        e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
    ): void => {
        const { name, value, type } = e.target;
        const checked = 'checked' in e.target ? e.target.checked : false;
        setForm(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
        if (fieldErrors[name]) {
            setFieldErrors(prev => { const next = { ...prev }; delete next[name]; return next; });
        }
    }, [fieldErrors]);

    const handleArrayFieldChange = useCallback((field: 'hinh_anh' | 'tep_dinh_kem', urls: string[]) => {
        setForm(prev => ({ ...prev, [field]: urls }));
    }, []);

    const handleSemesterChange = useCallback((e: React.ChangeEvent<HTMLSelectElement>): void => {
        const selected = e.target.value;
        const parsed = parseSemesterString(selected) as ParsedSemester | null;
        if (!parsed) return;
        setForm(prev => ({ ...prev, hoc_ky: parsed.hocKy, nam_hoc: parsed.year }));
        setFieldErrors(prev => { const next = { ...prev }; delete next.hoc_ky; delete next.nam_hoc; return next; });
    }, []);

    const validate = (): FieldErrors => {
        const errs: FieldErrors = {};
        if (!form.ten_hd.trim()) errs.ten_hd = 'Vui lòng nhập tên hoạt động';
        if (!form.loai_hd_id) errs.loai_hd_id = 'Vui lòng chọn loại hoạt động';
        if (!form.ngay_bd) errs.ngay_bd = 'Chọn thời gian bắt đầu';
        if (!form.ngay_kt) errs.ngay_kt = 'Chọn thời gian kết thúc';
        if (form.ngay_bd && form.ngay_kt && new Date(form.ngay_kt) < new Date(form.ngay_bd)) {
            errs.ngay_kt = 'Thời gian kết thúc phải sau bắt đầu';
        }
        const diem = parseFloat(form.diem_rl);
        if (form.diem_rl !== '' && (isNaN(diem) || diem < 0)) errs.diem_rl = 'Điểm không hợp lệ';
        if (form.yeu_cau_gps) {
            const lat = Number(form.geo_latitude);
            const lng = Number(form.geo_longitude);
            const radius = Number(form.geo_radius_meters);
            if (!form.geo_latitude || !Number.isFinite(lat) || lat < -90 || lat > 90) errs.geo_latitude = 'Vĩ độ không hợp lệ';
            if (!form.geo_longitude || !Number.isFinite(lng) || lng < -180 || lng > 180) errs.geo_longitude = 'Kinh độ không hợp lệ';
            if (!Number.isFinite(radius) || radius < 50 || radius > 1000) errs.geo_radius_meters = 'Bán kính từ 50 đến 1000m';
        }
        return errs;
    };

    const getReturnPath = useCallback((): string => {
        if (isMonitorRoute) return '/monitor/activities';
        if (isTeacherRoute) return '/teacher/activities';
        if (isAdminRoute) return '/admin/activities';
        return '/activities';
    }, [isAdminRoute, isMonitorRoute, isTeacherRoute]);

    const handleSubmit = async (e: React.FormEvent): Promise<void> => {
        e.preventDefault();

        const errs = validate();
        setFieldErrors(errs);
        if (Object.keys(errs).length > 0) return;

        setStatus(s => ({ ...s, submitting: true }));

        const ngayBatDauIso = toISOWithTimezone(form.ngay_bd);
        const ngayKetThucIso = toISOWithTimezone(form.ngay_kt);
        const hanDangKyIso = toISOWithTimezone(form.han_dk);

        if (!ngayBatDauIso || !ngayKetThucIso) {
            showError('Thời gian bắt đầu/kết thúc không hợp lệ');
            setStatus(s => ({ ...s, submitting: false }));
            return;
        }

        const payload: any = {
            // Backend validators expect legacy field names
            ten_hoat_dong: form.ten_hd,
            loai_hoat_dong_id: form.loai_hd_id,
            mo_ta: form.mo_ta || undefined,
            ngay_bat_dau: ngayBatDauIso,
            ngay_ket_thuc: ngayKetThucIso,
            han_dk: hanDangKyIso || undefined,
            diem_ren_luyen: form.diem_rl === '' ? 0 : Number(form.diem_rl),
            dia_diem: form.dia_diem || undefined,
            so_luong_toi_da: form.sl_toi_da === '' ? undefined : Number(form.sl_toi_da),
            pham_vi: isAdminRoute ? 'toan_truong' : 'lop',
            hoc_ky: form.hoc_ky,
            nam_hoc: form.nam_hoc,
            yeu_cau_gps: form.yeu_cau_gps,
            cho_phep_fallback: form.cho_phep_fallback,
            geo_latitude: form.yeu_cau_gps ? Number(form.geo_latitude) : undefined,
            geo_longitude: form.yeu_cau_gps ? Number(form.geo_longitude) : undefined,
            geo_radius_meters: form.yeu_cau_gps ? Number(form.geo_radius_meters || 100) : undefined,
            hinh_anh: form.hinh_anh.length > 0 ? form.hinh_anh : undefined,
            tep_dinh_kem: form.tep_dinh_kem.length > 0 ? form.tep_dinh_kem : undefined,
        };

        try {
            if (isEditMode && activityId) {
                await activityApi.updateActivity(activityId, payload);
                showSuccess('Cập nhật hoạt động thành công!');
            } else {
                await activityApi.createActivity(payload);
                showSuccess('Tạo hoạt động thành công!');
            }
            setTimeout(() => navigate(getReturnPath(), { replace: true }), 600);
        } catch (err) {
            const apiError = err as { response?: { data?: { message?: string; errors?: Array<{ message?: string }> } }; message?: string };
            const errorMessage = apiError.response?.data?.errors?.[0]?.message
                || apiError.response?.data?.message
                || apiError.message
                || 'Lỗi không xác định';
            showError(errorMessage);
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
        handleArrayFieldChange,
        handleSubmit,
        semesterOptions,
        currentSemesterValue: getCurrentSemesterValue(),
        handleSemesterChange,
        isWritable,
        currentSemester,
    };
}

export default useManageActivity;
