/**
 * RegisterDto
 * Data Transfer Object for registration request
 */
class RegisterDto {
  constructor(data) {
    this.maso = data.maso;
    this.email = data.email;
    this.ho_ten = data.ho_ten;
    this.password = data.password;
    this.khoa = data.khoa;
    this.lop_id = data.lop_id;
  }

  static fromRequest(body) {
    return new RegisterDto({
      maso: body.maso,
      email: body.email,
      ho_ten: body.ho_ten,
      password: body.password,
      khoa: body.khoa,
      lop_id: body.lop_id
    });
  }
}

module.exports = RegisterDto;

