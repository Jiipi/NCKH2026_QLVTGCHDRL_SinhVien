/**
 * useManageActivity Hook - TypeScript Version
 * Business Layer - Activity create/edit management
 */

import { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { activityApi, activityTypeApi } from '../../../../shared/api/repositories';
import { useNotification } from '../../../../shared/contexts/NotificationContext';
import useSemesterData, { getGlobalSemester } from '../../../../shared/hooks/useSemesterData';
import { buildSemesterValue, parseSemesterString, isSameSemester } from '../../../../shared/lib/semester';
import type { ActivityType, CreateActivityDto } from '../../../../shared/types';

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

const formatDateTimeLocal = (value: string | Date | null | undefined): string => {
    if (!value) return '';
    try {
        const dt = new Date(value);
        if (isNaN(dt.getTime())) return '';
        const year = dt.getFullYear();
        const month = String(dt.getMonth() + 1).padStart(2, '0');
        const day = String(dt.getDate()).padStart(2, '0');
        const hours = String(dt.getHours()).padStart(2, '0');
        const minutes = String(dt.getMinutes()).padStart(2, '0');
        return `${year}-${month}-${day}T${hours}:${minutes}`;
    } catch (e) { return ''; }
};

/**
 * useManageActivity - Hook tạo/sửa hoạt động
 */
export function useManageActivity(): UseManageActivityReturn {
    const { id: activityId } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { showSuccess, showError } = useNotification();
    const isEditMode = !!activityId;

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
                const d = await activityApi.getActivityById(activityId);
                setForm({
                    ten_hd: d.ten_hd || '',
                    loai_hd_id: d.loai_hd_id || '',
                    mo_ta: d.mo_ta || '',
                    ngay_bd: formatDateTimeLocal(d.ngay_bd),
                    ngay_kt: formatDateTimeLocal(d.ngay_kt),
                    han_dk: formatDateTimeLocal(d.han_dk),
                    diem_rl: d.diem_cong?.toString() || '',
                    dia_diem: d.dia_diem || '',
                    sl_toi_da: d.so_luong_toi_da?.toString() || '',
                    nam_hoc: d.nam_hoc || getDefaultYear(),
                    hoc_ky: d.hoc_ky?.toString() || getDefaultSemester(),
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
        const { name, value } = e.target;
        setForm(prev => ({ ...prev, [name]: value }));
        if (fieldErrors[name]) {
            setFieldErrors(prev => { const next = { ...prev }; delete next[name]; return next; });
        }
    }, [fieldErrors]);

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
        return errs;
    };

    const handleSubmit = async (e: React.FormEvent): Promise<void> => {
        e.preventDefault();

        const errs = validate();
        setFieldErrors(errs);
        if (Object.keys(errs).length > 0) return;

        setStatus(s => ({ ...s, submitting: true }));

        const payload: CreateActivityDto = {
            ten_hd: form.ten_hd,
            loai_hd_id: form.loai_hd_id,
            mo_ta: form.mo_ta || undefined,
            ngay_bd: form.ngay_bd,
            ngay_kt: form.ngay_kt,
            han_dk: form.han_dk || undefined,
            diem_cong: form.diem_rl === '' ? 0 : Number(form.diem_rl),
            dia_diem: form.dia_diem || undefined,
            so_luong_toi_da: form.sl_toi_da === '' ? undefined : Number(form.sl_toi_da),
        };

        try {
            if (isEditMode && activityId) {
                await activityApi.updateActivity(activityId, payload);
                showSuccess('Cập nhật hoạt động thành công!');
            } else {
                await activityApi.createActivity(payload);
                showSuccess('Tạo hoạt động thành công!');
            }
            setTimeout(() => navigate(-1 as unknown as string), 1000);
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Lỗi không xác định';
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
        handleSubmit,
        semesterOptions,
        currentSemesterValue: getCurrentSemesterValue(),
        handleSemesterChange,
        isWritable,
        currentSemester,
    };
}

export default useManageActivity;
