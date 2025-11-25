/**
 * CreateActivityDto
 * Data Transfer Object for creating a new activity
 */
class CreateActivityDto {
  constructor(data) {
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
    this.nam_hoc = data.nam_hoc;
    this.hinh_anh = data.hinh_anh;
    this.tep_dinh_kem = data.tep_dinh_kem;
  }

  static fromRequest(body) {
    return new CreateActivityDto(body);
  }

  toDomain() {
    const toNumberOrNull = (v) => {
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
      tep_dinh_kem: this.tep_dinh_kem || []
    };
  }
}

module.exports = CreateActivityDto;

