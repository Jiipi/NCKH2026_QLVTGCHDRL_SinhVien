/**
 * LoginDto
 * Data Transfer Object for login request
 */
class LoginDto {
  constructor(data) {
    this.maso = data.maso;
    this.password = data.password;
    this.remember = data.remember || false;
  }

  static fromRequest(body) {
    return new LoginDto({
      maso: body.maso,
      password: body.password,
      remember: body.remember || false
    });
  }
}

module.exports = LoginDto;

