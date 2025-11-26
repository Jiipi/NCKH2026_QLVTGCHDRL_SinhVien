/**
 * UpdateActivityDto
 * Data Transfer Object for updating an activity
 * Chỉ chứa các fields được phép update
 */
class UpdateActivityDto {
  constructor(data) {
    // Only allow specific fields for update
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
    // Chuẩn hóa nam_hoc: chỉ lưu năm đầu tiên
    this.nam_hoc = data.nam_hoc !== undefined ? this._normalizeNamHoc(data.nam_hoc) : undefined;
    this.hinh_anh = data.hinh_anh;
    this.tep_dinh_kem = data.tep_dinh_kem;
  }

  /**
   * Chuẩn hóa năm học: chỉ lấy năm đầu tiên
   * "2024-2025" -> "2024"
   * "2024" -> "2024"
   */
  _normalizeNamHoc(value) {
    if (!value) return null;
    const str = String(value);
    const match = str.match(/^(\d{4})/);
    return match ? match[1] : str;
  }

  static fromRequest(body) {
    return new UpdateActivityDto(body);
  }

  /**
   * Convert to domain object, only including defined fields
   * @returns {Object} Domain object with only defined fields
   */
  toDomain() {
    const toNumberOrNull = (v) => {
      if (v === undefined || v === null || v === '') return null;
      const n = Number(v);
      return Number.isFinite(n) ? n : null;
    };

    const result = {};
    
    // Only include fields that are explicitly defined
    if (this.ten_hd !== undefined) result.ten_hd = this.ten_hd || '';
    if (this.mo_ta !== undefined) result.mo_ta = this.mo_ta || null;
    if (this.loai_hd_id !== undefined) result.loai_hd_id = this.loai_hd_id || null;
    if (this.ngay_bd !== undefined) result.ngay_bd = this.ngay_bd || null;
    if (this.ngay_kt !== undefined) result.ngay_kt = this.ngay_kt || null;
    if (this.han_dk !== undefined) result.han_dk = this.han_dk || null;
    if (this.sl_toi_da !== undefined) result.sl_toi_da = toNumberOrNull(this.sl_toi_da);
    if (this.diem_rl !== undefined) result.diem_rl = toNumberOrNull(this.diem_rl);
    if (this.dia_diem !== undefined) result.dia_diem = this.dia_diem || null;
    if (this.hoc_ky !== undefined) result.hoc_ky = this.hoc_ky || null;
    if (this.nam_hoc !== undefined) result.nam_hoc = this.nam_hoc || null;
    if (this.hinh_anh !== undefined) result.hinh_anh = Array.isArray(this.hinh_anh) ? this.hinh_anh : [];
    if (this.tep_dinh_kem !== undefined) result.tep_dinh_kem = Array.isArray(this.tep_dinh_kem) ? this.tep_dinh_kem : [];
    
    return result;
  }

  /**
   * Get list of fields that will be updated
   * @returns {string[]} List of field names
   */
  getUpdatedFields() {
    return Object.keys(this.toDomain());
  }
}

module.exports = UpdateActivityDto;
