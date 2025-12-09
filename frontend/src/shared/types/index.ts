/**
 * Shared TypeScript Types for Frontend
 * 3-tier Architecture - Shared Types Layer
 */

// ============ BASE TYPES ============
export interface PaginationParams {
    page?: number;
    limit?: number | 'all';
}

export interface PaginatedResponse<T> {
    items: T[];
    pagination: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
    };
}

export interface ApiResponse<T> {
    success: boolean;
    data: T;
    message?: string;
}

// ============ ACTIVITY TYPES ============
export type ActivityStatus = 'cho_duyet' | 'da_duyet' | 'tu_choi' | 'ket_thuc';
export type RegistrationStatus = 'cho_duyet' | 'da_duyet' | 'tu_choi' | 'da_tham_gia' | 'vang';

export interface Activity {
    id: string;
    ten_hd: string;
    mo_ta?: string;
    ngay_bd: string;
    ngay_kt: string;
    han_dk?: string;
    dia_diem?: string;
    so_luong_toi_da?: number;
    diem_cong?: number;
    trang_thai: ActivityStatus;
    loai_hd_id?: string;
    loai_hd?: ActivityType;
    nguoi_tao_id?: string;
    lop_id?: string;
    hoc_ky?: number;
    nam_hoc?: string;
    ngay_tao?: string;
    ngay_cap_nhat?: string;
    // Enriched fields for students
    is_registered?: boolean;
    registration_status?: RegistrationStatus;
    trang_thai_dk?: RegistrationStatus;
}

export interface ActivityType {
    id: string;
    ten_loai: string;
    mo_ta?: string;
    diem_toi_da?: number;
    is_active?: boolean;
}

export interface GetActivitiesParams extends PaginationParams {
    search?: string;
    status?: ActivityStatus | 'open' | 'soon' | 'closed';
    type?: string;
    semester?: string;
    from?: string;
    to?: string;
    classId?: string;
    creatorId?: string;
    sort?: string;
    order?: 'asc' | 'desc';
}

export interface CreateActivityDto {
    ten_hd: string;
    mo_ta?: string;
    ngay_bd: string;
    ngay_kt: string;
    han_dk?: string;
    dia_diem?: string;
    so_luong_toi_da?: number;
    diem_cong?: number;
    loai_hd_id: string;
    lop_id?: string;
}

export interface UpdateActivityDto extends Partial<CreateActivityDto> { }

// ============ USER TYPES ============
export type UserRole = 'ADMIN' | 'GIANG_VIEN' | 'LOP_TRUONG' | 'SINH_VIEN';

export interface User {
    id: string;
    email: string;
    ho_ten: string;
    ma_so?: string;
    avatar?: string;
    vai_tro?: {
        id: string;
        ten_vt: string;
    };
    lop?: {
        id: string;
        ten_lop: string;
    };
    is_active?: boolean;
}

export interface AuthUser extends User {
    role: UserRole;
    permissions?: string[];
}

// ============ REGISTRATION TYPES ============
export interface Registration {
    id: string;
    hd_id: string;
    sv_id: string;
    trang_thai_dk: RegistrationStatus;
    ngay_dang_ky: string;
    ghi_chu?: string;
    hoat_dong?: Activity;
    sinh_vien?: {
        id: string;
        ma_sv: string;
        nguoi_dung?: {
            ho_ten: string;
        };
    };
}

export interface ApproveRegistrationDto {
    note?: string;
}

export interface RejectRegistrationDto {
    reason: string;
}

// ============ DASHBOARD TYPES ============
export interface DashboardStats {
    totalActivities?: number;
    totalRegistrations?: number;
    pendingApprovals?: number;
    completedActivities?: number;
    totalPoints?: number;
}

// ============ NOTIFICATION TYPES ============
export interface Notification {
    id: string;
    tieu_de: string;
    noi_dung: string;
    loai?: string;
    da_doc: boolean;
    ngay_tao: string;
}

// ============ SEMESTER TYPES ============
export interface Semester {
    id: string;
    ten_hk: string;
    hoc_ky: number;
    nam_hoc: string;
    ngay_bd: string;
    ngay_kt: string;
    is_active: boolean;
    is_locked: boolean;
}

// ============ CLASS TYPES ============
export interface Class {
    id: string;
    ten_lop: string;
    ma_lop: string;
    khoa?: string;
    chu_nhiem?: string;
}

// ============ POINTS TYPES ============
export interface StudentPoints {
    totalPoints: number;
    rank?: string;
    semester?: string;
    details?: PointDetail[];
}

export interface PointDetail {
    activityId: string;
    activityName: string;
    points: number;
    earnedAt: string;
}
