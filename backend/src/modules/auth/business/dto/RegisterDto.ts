/**
 * RegisterDto
 * Data Transfer Object for registration request
 */

export interface RegisterDtoData {
  maso: string;
  email: string;
  ho_ten: string;
  password: string;
  khoa?: string;
  lop_id?: string;
  ngay_sinh?: string | Date;
  gioi_tinh?: string;
  sdt?: string;
  dia_chi?: string;
}

export class RegisterDto {
  maso: string;
  email: string;
  ho_ten: string;
  password: string;
  khoa?: string;
  lop_id?: string;
  ngay_sinh?: string | Date;
  gioi_tinh?: string;
  sdt?: string;
  dia_chi?: string;

  constructor(data: RegisterDtoData) {
    this.maso = data.maso;
    this.email = data.email;
    this.ho_ten = data.ho_ten;
    this.password = data.password;
    this.khoa = data.khoa;
    this.lop_id = data.lop_id;
    this.ngay_sinh = data.ngay_sinh;
    this.gioi_tinh = data.gioi_tinh;
    this.sdt = data.sdt;
    this.dia_chi = data.dia_chi;
  }

  static fromRequest(body: Record<string, unknown>): RegisterDto {
    return new RegisterDto({
      maso: String(body.maso || ''),
      email: String(body.email || ''),
      ho_ten: String(body.ho_ten || ''),
      password: String(body.password || ''),
      khoa: body.khoa ? String(body.khoa) : undefined,
      lop_id: body.lop_id ? String(body.lop_id) : (body.lopId ? String(body.lopId) : undefined),
      ngay_sinh: body.ngay_sinh ? String(body.ngay_sinh) : (body.ngaySinh ? String(body.ngaySinh) : undefined),
      gioi_tinh: body.gioi_tinh ? String(body.gioi_tinh) : (body.gioiTinh ? String(body.gioiTinh) : undefined),
      sdt: body.sdt ? String(body.sdt) : undefined,
      dia_chi: body.dia_chi ? String(body.dia_chi) : (body.diaChi ? String(body.diaChi) : undefined),
    });
  }
}

export default RegisterDto;
