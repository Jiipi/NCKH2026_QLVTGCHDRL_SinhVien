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

  static fromRequest(body: Record<string, unknown>): LoginDto {
    return new LoginDto({
      maso: String(body.maso || ''),
      password: String(body.password || ''),
      remember: Boolean(body.remember)
    });
  }
}

export default LoginDto;
