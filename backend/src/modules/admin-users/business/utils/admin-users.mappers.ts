/**
 * Admin Users Mappers
 * Functions for transforming user data
 */

import { CSV_HEADERS } from './admin-users.constants';

interface LopInfo {
  id?: string;
  ten_lop?: string;
  khoa?: string;
  nien_khoa?: string;
}

interface SinhVienInfo {
  id?: string;
  mssv?: string;
  ngay_sinh?: Date;
  gt?: string;
  dia_chi?: string | null;
  sdt?: string | null;
  email?: string | null;
  lop?: LopInfo | null;
}

interface VaiTroInfo {
  id: string;
  ten_vt?: string;
  quyen_han?: unknown[];
}

interface UserWithRelations {
  id: string;
  ten_dn: string;
  ho_ten?: string | null;
  email: string;
  anh_dai_dien?: string | null;
  vai_tro_id?: string;
  vai_tro?: VaiTroInfo | null;
  sinh_vien?: SinhVienInfo | null;
  trang_thai?: string;
  ngay_tao?: Date;
  _count?: {
    lops_chu_nhiem?: number;
    hoat_dong_tao?: number;
  };
}

export interface UserListItem {
  id: string;
  maso: string;
  hoten: string | null | undefined;
  email: string;
  ten_dn: string;
  ho_ten: string | null | undefined;
  anh_dai_dien: string | null | undefined;
  vai_tro_id: string | undefined;
  vai_tro: { id: string; ten_vt: string | undefined } | null;
  role: string;
  lop: string;
  khoa: string;
  sdt: string;
  so_lop_cn: number;
  so_hd_tao: number;
  quyen_count: number;
  trang_thai: string | undefined;
  ngay_tao: Date | undefined;
  sinh_vien: {
    mssv?: string;
    ngay_sinh?: Date;
    gt?: string;
    dia_chi?: string | null;
    sdt?: string | null;
    email?: string | null;
    nguoi_dung: {
      ho_ten: string | null | undefined;
      email: string;
      anh_dai_dien: string | null | undefined;
    };
    lop?: {
      ten_lop?: string;
      khoa?: string;
      nien_khoa?: string;
    } | null;
  } | null;
}

export interface UserDetail {
  id: string;
  ho_ten: string | null | undefined;
  email: string;
  ten_dn: string;
  vai_tro: string;
  trang_thai: string | undefined;
  ngay_tao: Date | undefined;
  sinh_vien: {
    mssv?: string;
    ngay_sinh?: Date;
    gt?: string;
    dia_chi?: string | null;
    sdt?: string | null;
    email?: string | null;
    lop?: {
      ten_lop?: string;
      khoa?: string;
      nien_khoa?: string;
    } | null;
  } | null;
}

export function mapUserToListItem(user: UserWithRelations): UserListItem {
  return {
    id: user.id,
    maso: user.ten_dn,
    hoten: user.ho_ten,
    email: user.email,
    ten_dn: user.ten_dn,
    ho_ten: user.ho_ten,
    anh_dai_dien: user.anh_dai_dien,
    vai_tro_id: user.vai_tro_id,
    vai_tro: user.vai_tro ? { id: user.vai_tro.id, ten_vt: user.vai_tro.ten_vt } : null,
    role: user.vai_tro?.ten_vt || 'Sinh viên',
    lop: user.sinh_vien?.lop?.ten_lop || '',
    khoa: user.sinh_vien?.lop?.khoa || '',
    sdt: user.sinh_vien?.sdt || '',
    so_lop_cn: user._count?.lops_chu_nhiem || 0,
    so_hd_tao: user._count?.hoat_dong_tao || 0,
    quyen_count: Array.isArray(user.vai_tro?.quyen_han) ? user.vai_tro.quyen_han.length : 0,
    trang_thai: user.trang_thai,
    ngay_tao: user.ngay_tao,
    sinh_vien: user.sinh_vien
      ? {
          mssv: user.sinh_vien.mssv,
          ngay_sinh: user.sinh_vien.ngay_sinh,
          gt: user.sinh_vien.gt,
          dia_chi: user.sinh_vien.dia_chi,
          sdt: user.sinh_vien.sdt,
          email: user.sinh_vien.email,
          nguoi_dung: {
            ho_ten: user.ho_ten,
            email: user.email,
            anh_dai_dien: user.anh_dai_dien
          },
          lop: user.sinh_vien.lop
            ? {
                ten_lop: user.sinh_vien.lop.ten_lop,
                khoa: user.sinh_vien.lop.khoa,
                nien_khoa: user.sinh_vien.lop.nien_khoa
              }
            : null
        }
      : null
  };
}

export function mapUserToDetail(user: UserWithRelations): UserDetail {
  return {
    id: user.id,
    ho_ten: user.ho_ten,
    email: user.email,
    ten_dn: user.ten_dn,
    vai_tro: user.vai_tro?.ten_vt || 'ADMIN',
    trang_thai: user.trang_thai,
    ngay_tao: user.ngay_tao,
    sinh_vien: user.sinh_vien
      ? {
          mssv: user.sinh_vien.mssv,
          ngay_sinh: user.sinh_vien.ngay_sinh,
          gt: user.sinh_vien.gt,
          dia_chi: user.sinh_vien.dia_chi,
          sdt: user.sinh_vien.sdt,
          email: user.sinh_vien.email,
          lop: user.sinh_vien.lop
            ? {
                ten_lop: user.sinh_vien.lop.ten_lop,
                khoa: user.sinh_vien.lop.khoa,
                nien_khoa: user.sinh_vien.lop.nien_khoa
              }
            : null
        }
      : null
  };
}

export function mapUsersToCsv(users: UserWithRelations[]): string {
  const rows = users.map((user) => [
    user.ten_dn,
    user.ho_ten || '',
    user.email,
    user.vai_tro?.ten_vt || '',
    user.trang_thai || '',
    user.sinh_vien?.lop?.ten_lop || '',
    user.sinh_vien?.lop?.khoa || '',
    user.ngay_tao?.toISOString?.() || ''
  ]);

  const csv = [
    CSV_HEADERS.join(','),
    ...rows.map((row) => row.map((value) => `"${String(value).replace(/"/g, '""')}"`).join(','))
  ].join('\n');

  return `\uFEFF${csv}`;
}

module.exports = {
  mapUserToListItem,
  mapUserToDetail,
  mapUsersToCsv
};
