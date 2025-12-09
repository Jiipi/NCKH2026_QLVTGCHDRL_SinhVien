/**
 * Shared TypeScript Types for Backend
 * Core layer - Used across all modules
 */

// ============ BASE TYPES ============
export interface PaginationParams {
    page?: number;
    limit?: number | 'all';
    sort?: string;
    order?: 'asc' | 'desc';
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

// ============ USER TYPES ============
export type UserRole = 'ADMIN' | 'GIANG_VIEN' | 'LOP_TRUONG' | 'SINH_VIEN';

export interface User {
    id: string;
    email: string;
    ho_ten: string;
    ma_so?: string;
    avatar?: string;
    vai_tro_id?: string;
    lop_id?: string;
    is_active?: boolean;
    ngay_tao?: Date;
    ngay_cap_nhat?: Date;
}

export interface AuthPayload {
    sub: string;      // User ID
    email: string;
    role: UserRole;
    permissions?: string[];
    iat?: number;
    exp?: number;
}

// ============ ACTIVITY TYPES ============
export type ActivityStatus = 'cho_duyet' | 'da_duyet' | 'tu_choi' | 'ket_thuc';
export type RegistrationStatus = 'cho_duyet' | 'da_duyet' | 'tu_choi' | 'da_tham_gia' | 'vang';

export interface Activity {
    id: string;
    ten_hd: string;
    mo_ta?: string;
    ngay_bd: Date;
    ngay_kt: Date;
    han_dk?: Date;
    dia_diem?: string;
    so_luong_toi_da?: number;
    diem_cong?: number;
    trang_thai: ActivityStatus;
    loai_hd_id?: string;
    nguoi_tao_id?: string;
    lop_id?: string;
    hoc_ky?: number;
    nam_hoc?: string;
    ngay_tao?: Date;
    ngay_cap_nhat?: Date;
}

export interface ActivityType {
    id: string;
    ten_loai: string;
    mo_ta?: string;
    diem_toi_da?: number;
    is_active?: boolean;
}

export interface Registration {
    id: string;
    hd_id: string;
    sv_id: string;
    trang_thai_dk: RegistrationStatus;
    ngay_dang_ky: Date;
    ghi_chu?: string;
}

// ============ SEMESTER TYPES ============
export interface Semester {
    id: string;
    ten_hk: string;
    hoc_ky: number;
    nam_hoc: string;
    ngay_bd: Date;
    ngay_kt: Date;
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

// ============ NOTIFICATION TYPES ============
export interface Notification {
    id: string;
    tieu_de: string;
    noi_dung: string;
    loai?: string;
    nguoi_nhan_id?: string;
    da_doc: boolean;
    ngay_tao: Date;
}

// ============ REQUEST/RESPONSE TYPES ============
export interface RequestWithUser extends Request {
    user?: AuthPayload;
}

// ============ SERVICE INTERFACES ============
export interface IActivityService {
    getActivities(params: PaginationParams, user?: AuthPayload): Promise<PaginatedResponse<Activity>>;
    getActivityById(id: string): Promise<Activity | null>;
    createActivity(data: Partial<Activity>, userId: string): Promise<Activity>;
    updateActivity(id: string, data: Partial<Activity>): Promise<Activity>;
    deleteActivity(id: string): Promise<void>;
    approveActivity(id: string, note?: string): Promise<Activity>;
    rejectActivity(id: string, reason: string): Promise<Activity>;
}

export interface IRegistrationService {
    getRegistrations(params: PaginationParams): Promise<PaginatedResponse<Registration>>;
    registerActivity(activityId: string, studentId: string): Promise<Registration>;
    cancelRegistration(activityId: string, studentId: string): Promise<void>;
    approveRegistration(id: string, note?: string): Promise<Registration>;
    rejectRegistration(id: string, reason: string): Promise<Registration>;
}

export interface IUserService {
    getUsers(params: PaginationParams): Promise<PaginatedResponse<User>>;
    getUserById(id: string): Promise<User | null>;
    createUser(data: Partial<User>): Promise<User>;
    updateUser(id: string, data: Partial<User>): Promise<User>;
    deleteUser(id: string): Promise<void>;
}
