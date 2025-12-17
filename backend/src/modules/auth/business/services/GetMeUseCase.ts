/**
 * GetMeUseCase
 * Use case for getting current user info
 * Follows Single Responsibility Principle (SRP)
 */

import { NotFoundError } from '../../../../core/errors/AppError';
import { IAuthRepository, UserWithRole } from '../interfaces/IAuthRepository';

export interface UserDTO {
  id: string;
  maso: string;
  email: string | null;
  ho_ten: string;
  roleCode: string;
  roleName: string;
  avatar: string | null;
  status: string;
}

class GetMeUseCase {
  private authRepository: IAuthRepository;

  constructor(authRepository: IAuthRepository) {
    this.authRepository = authRepository;
  }

  async execute(userId: string): Promise<UserDTO> {
    // userId is the UUID from JWT token's sub claim
    const user = await this.authRepository.findUserById(userId);
    
    if (!user) {
      throw new NotFoundError('Người dùng không tồn tại');
    }

    return this.toUserDTO(user);
  }

  private toUserDTO(user: UserWithRole): UserDTO {
    const role = user.vai_tro;
    return {
      id: user.id,
      maso: user.ten_dn,
      email: user.email,
      ho_ten: user.ho_ten,
      roleCode: role?.ten_vt || 'STUDENT',
      roleName: role?.mo_ta || 'Sinh viên',
      avatar: user.anh_dai_dien,
      status: user.trang_thai
    };
  }
}

export default GetMeUseCase;
