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

  static fromRequest(body: any): RegisterDto {
    return new RegisterDto({
      maso: body.maso,
      email: body.email,
      ho_ten: body.ho_ten,
      password: body.password,
      khoa: body.khoa,
      lop_id: body.lop_id || body.lopId, // Support both formats
      ngay_sinh: body.ngay_sinh || body.ngaySinh, // Support both formats
      gioi_tinh: body.gioi_tinh || body.gioiTinh, // Support both formats
      sdt: body.sdt,
      dia_chi: body.dia_chi || body.diaChi // Support both formats
    });
  }
}

export default RegisterDto;
