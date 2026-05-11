import type { HocKy } from '@prisma/client';

/**
 * Input data structure for CreateActivityDto
 */
interface CreateActivityInput {
  ten_hd?: string;
  ten_hoat_dong?: string;
  mo_ta?: string;
  loai_hd_id?: string;
  loai_hoat_dong_id?: string;
  ngay_bd?: string | Date;
  ngay_bat_dau?: string | Date;
  ngay_kt?: string | Date;
  ngay_ket_thuc?: string | Date;
  han_dk?: string | Date;
  sl_toi_da?: number | string;
  so_luong_toi_da?: number | string;
  diem_rl?: number | string;
  diem_ren_luyen?: number | string;
  dia_diem?: string;
  hoc_ky?: HocKy;
  nam_hoc?: string | number;
  hinh_anh?: string[];
  tep_dinh_kem?: string[];
  yeu_cau_gps?: boolean;
  cho_phep_fallback?: boolean;
  geo_latitude?: number | string;
  geo_longitude?: number | string;
  geo_radius_meters?: number | string;
}

/**
 * Domain data structure for activity creation
 */
interface CreateActivityDomain {
  ten_hd: string;
  mo_ta: string | null;
  loai_hd_id: string | null;
  ngay_bd: string | Date | null;
  ngay_kt: string | Date | null;
  han_dk: string | Date | null;
  sl_toi_da: number | null;
  diem_rl: number | null;
  dia_diem: string | null;
  hoc_ky: HocKy | null;
  nam_hoc: string | null;
  hinh_anh: string[];
  tep_dinh_kem: string[];
  yeu_cau_gps: boolean;
  cho_phep_fallback: boolean;
  geo_latitude: number | null;
  geo_longitude: number | null;
  geo_radius_meters: number | null;
}

/**
 * CreateActivityDto
 * Data Transfer Object for creating a new activity
 */
class CreateActivityDto {
  ten_hd?: string;
  mo_ta?: string;
  loai_hd_id?: string;
  ngay_bd?: string | Date;
  ngay_kt?: string | Date;
  han_dk?: string | Date;
  sl_toi_da?: number | string;
  diem_rl?: number | string;
  dia_diem?: string;
  hoc_ky?: HocKy;
  nam_hoc?: string | null;
  hinh_anh?: string[];
  tep_dinh_kem?: string[];
  yeu_cau_gps?: boolean;
  cho_phep_fallback?: boolean;
  geo_latitude?: number | string;
  geo_longitude?: number | string;
  geo_radius_meters?: number | string;

  constructor(data: CreateActivityInput) {
    this.ten_hd = data.ten_hd || data.ten_hoat_dong;
    this.mo_ta = data.mo_ta;
    this.loai_hd_id = data.loai_hd_id || data.loai_hoat_dong_id;
    this.ngay_bd = data.ngay_bd || data.ngay_bat_dau;
    this.ngay_kt = data.ngay_kt || data.ngay_ket_thuc;
    this.han_dk = data.han_dk;
    this.sl_toi_da = data.sl_toi_da || data.so_luong_toi_da;
    this.diem_rl = data.diem_rl || data.diem_ren_luyen;
    this.dia_diem = data.dia_diem;
    this.hoc_ky = data.hoc_ky;
    // Chuẩn hóa nam_hoc: chỉ lưu năm đầu tiên (2024-2025 -> 2024)
    this.nam_hoc = this._normalizeNamHoc(data.nam_hoc);
    this.hinh_anh = data.hinh_anh;
    this.tep_dinh_kem = data.tep_dinh_kem;
    this.yeu_cau_gps = data.yeu_cau_gps;
    this.cho_phep_fallback = data.cho_phep_fallback;
    this.geo_latitude = data.geo_latitude;
    this.geo_longitude = data.geo_longitude;
    this.geo_radius_meters = data.geo_radius_meters;
  }

  /**
   * Chuẩn hóa năm học: chỉ lấy năm đầu tiên
   * "2024-2025" -> "2024"
   * "2024" -> "2024"
   */
  private _normalizeNamHoc(value?: string | number): string | null {
    if (!value) return null;
    const str = String(value);
    const match = str.match(/^(\d{4})/);
    return match ? match[1] : str;
  }

  static fromRequest(body: CreateActivityInput): CreateActivityDto {
    return new CreateActivityDto(body);
  }

  toDomain(): CreateActivityDomain {
    const toNumberOrNull = (v: number | string | undefined): number | null => {
      if (v === undefined || v === null || v === '') return null;
      const n = Number(v);
      return Number.isFinite(n) ? n : null;
    };

    return {
      ten_hd: this.ten_hd || '',
      mo_ta: this.mo_ta || null,
      loai_hd_id: this.loai_hd_id || null,
      ngay_bd: this.ngay_bd || null,
      ngay_kt: this.ngay_kt || null,
      han_dk: this.han_dk || null,
      sl_toi_da: toNumberOrNull(this.sl_toi_da),
      diem_rl: toNumberOrNull(this.diem_rl),
      dia_diem: this.dia_diem || null,
      hoc_ky: this.hoc_ky || null,
      nam_hoc: this.nam_hoc || null,
      hinh_anh: this.hinh_anh || [],
      tep_dinh_kem: this.tep_dinh_kem || [],
      yeu_cau_gps: Boolean(this.yeu_cau_gps),
      cho_phep_fallback: this.cho_phep_fallback !== false,
      geo_latitude: this.yeu_cau_gps ? toNumberOrNull(this.geo_latitude) : null,
      geo_longitude: this.yeu_cau_gps ? toNumberOrNull(this.geo_longitude) : null,
      geo_radius_meters: this.yeu_cau_gps ? toNumberOrNull(this.geo_radius_meters) || 100 : null
    };
  }
}

export default CreateActivityDto;
module.exports = CreateActivityDto;
