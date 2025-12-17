/**
 * LoginDto
 * Data Transfer Object for login request
 */

export interface LoginDtoData {
  maso: string;
  password: string;
  remember?: boolean;
}

export class LoginDto {
  maso: string;
  password: string;
  remember: boolean;

  constructor(data: LoginDtoData) {
    this.maso = data.maso;
    this.password = data.password;
    this.remember = data.remember || false;
  }

  static fromRequest(body: any): LoginDto {
    return new LoginDto({
      maso: body.maso,
      password: body.password,
      remember: body.remember || false
    });
  }
}

export default LoginDto;
