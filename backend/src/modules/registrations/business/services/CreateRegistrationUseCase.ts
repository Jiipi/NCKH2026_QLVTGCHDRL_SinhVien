/**
 * CreateRegistrationUseCase
 * Use case for creating a registration
 */

import { CreateRegistrationDto } from '../dto/CreateRegistrationDto';
import { ValidationError, NotFoundError } from '../../../../core/errors/AppError';
import { prisma } from '../../../../data/infrastructure/prisma/client';
import type { IRegistrationRepository } from '../interfaces/IRegistrationRepository';
import type { AuthUser } from '../helpers/registrationAccess';
import type { TrangThaiHoatDong } from '@prisma/client';

/**
 * Activity query result type
 */
interface ActivityQueryResult {
  id: string;
  ten_hd: string;
  trang_thai: TrangThaiHoatDong;
  sl_toi_da: number;
  han_dk: Date | null;
  ngay_bd: Date;
  _count: {
    dang_ky_hd: number;
  };
}

/**
 * CreateRegistrationUseCase
 */
export class CreateRegistrationUseCase {
  private registrationRepository: IRegistrationRepository;

  constructor(registrationRepository: IRegistrationRepository) {
    this.registrationRepository = registrationRepository;
  }

  async execute(dto: CreateRegistrationDto, user: AuthUser): Promise<unknown> {
    console.log('[CreateRegistrationUseCase] Execute:', {
      activityId: dto.activityId,
      userId: dto.userId,
      user: user?.id || user?.sub
    });
    
    if (!dto.activityId) {
      throw new ValidationError('activityId là bắt buộc');
    }

    if (!dto.userId) {
      console.error('[CreateRegistrationUseCase] userId is missing!', { dto, user });
      throw new ValidationError('userId là bắt buộc');
    }

    // Check activity exists using legacy schema
    const activity = await prisma.hoatDong.findUnique({
      where: { id: String(dto.activityId) },
      select: {
        id: true,
        ten_hd: true,
        trang_thai: true,
        sl_toi_da: true,
        han_dk: true,
        ngay_bd: true,
        _count: {
          select: {
            dang_ky_hd: {
              where: {
                trang_thai_dk: { in: ['cho_duyet', 'da_duyet'] }
              }
            }
          }
        }
      }
    }) as ActivityQueryResult | null;

    if (!activity) {
      throw new NotFoundError('Hoạt động không tồn tại');
    }

    // Check if activity is approved
    if (activity.trang_thai !== 'da_duyet') {
      throw new ValidationError('Hoạt động chưa được duyệt');
    }

    // Check max participants
    if (activity.sl_toi_da && activity._count.dang_ky_hd >= activity.sl_toi_da) {
      throw new ValidationError('Hoạt động đã đủ số lượng đăng ký');
    }

    // Check registration deadline
    const now = new Date();
    if (activity.han_dk && now > new Date(activity.han_dk)) {
      throw new ValidationError('Đã hết hạn đăng ký');
    }

    // Check if already registered
    const existing = await this.registrationRepository.findByUserAndActivity(
      dto.userId,
      dto.activityId
    );

    if (existing) {
      throw new ValidationError('Bạn đã đăng ký hoạt động này rồi');
    }

    // Create registration
    // Map status: 'PENDING' -> 'cho_duyet' (theo schema)
    console.log('[CreateRegistrationUseCase] Creating registration with:', {
      userId: dto.userId,
      activityId: dto.activityId,
      trang_thai_dk: 'cho_duyet',
      note: dto.note
    });
    
    const registration = await this.registrationRepository.create({
      userId: dto.userId,
      activityId: dto.activityId,
      trang_thai_dk: 'cho_duyet', // Dùng trực tiếp trang_thai_dk thay vì status
      note: dto.note
    });

    console.log('[CreateRegistrationUseCase] Registration created successfully');
    return registration;
  }
}

export default CreateRegistrationUseCase;
module.exports = CreateRegistrationUseCase;
