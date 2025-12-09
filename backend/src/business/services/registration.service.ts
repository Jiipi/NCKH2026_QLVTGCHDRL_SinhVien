/**
 * Registration Service
 * Business Layer - Registration business logic
 */

import type {
    Registration,
    PaginatedResponse,
    PaginationParams,
    IRegistrationService
} from '../../core/types';

// Import existing repository
const prisma = require('../../data/infrastructure/prisma/client');

/**
 * RegistrationService - Handle registration business logic
 */
export class RegistrationService implements IRegistrationService {

    async getRegistrations(params: PaginationParams): Promise<PaginatedResponse<Registration>> {
        const page = params.page || 1;
        const limit = typeof params.limit === 'number' ? params.limit : 10;
        const skip = (page - 1) * limit;

        const [items, total] = await Promise.all([
            prisma.dangKyHoatDong.findMany({
                skip,
                take: limit,
                orderBy: { ngay_dang_ky: 'desc' },
                include: {
                    hoat_dong: true,
                    sinh_vien: {
                        include: {
                            nguoi_dung: {
                                select: { ho_ten: true, email: true }
                            }
                        }
                    }
                }
            }),
            prisma.dangKyHoatDong.count()
        ]);

        return {
            items: items as Registration[],
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit)
            }
        };
    }

    async registerActivity(activityId: string, studentId: string): Promise<Registration> {
        // Check if already registered
        const existing = await prisma.dangKyHoatDong.findFirst({
            where: {
                hd_id: activityId,
                sv_id: studentId
            }
        });

        if (existing) {
            throw new Error('Đã đăng ký hoạt động này');
        }

        // Check activity capacity
        const activity = await prisma.hoatDong.findUnique({
            where: { id: activityId },
            include: { _count: { select: { dang_ky: true } } }
        });

        if (!activity) {
            throw new Error('Hoạt động không tồn tại');
        }

        if (activity.so_luong_toi_da && activity._count.dang_ky >= activity.so_luong_toi_da) {
            throw new Error('Hoạt động đã đủ số lượng đăng ký');
        }

        // Create registration
        return prisma.dangKyHoatDong.create({
            data: {
                hd_id: activityId,
                sv_id: studentId,
                trang_thai_dk: 'cho_duyet',
                ngay_dang_ky: new Date()
            }
        }) as Promise<Registration>;
    }

    async cancelRegistration(activityId: string, studentId: string): Promise<void> {
        const registration = await prisma.dangKyHoatDong.findFirst({
            where: {
                hd_id: activityId,
                sv_id: studentId,
                trang_thai_dk: 'cho_duyet'
            }
        });

        if (!registration) {
            throw new Error('Không tìm thấy đăng ký hoặc đăng ký đã được xử lý');
        }

        await prisma.dangKyHoatDong.delete({
            where: { id: registration.id }
        });
    }

    async approveRegistration(id: string, note?: string): Promise<Registration> {
        return prisma.dangKyHoatDong.update({
            where: { id },
            data: {
                trang_thai_dk: 'da_duyet',
                ghi_chu: note || null
            }
        }) as Promise<Registration>;
    }

    async rejectRegistration(id: string, reason: string): Promise<Registration> {
        return prisma.dangKyHoatDong.update({
            where: { id },
            data: {
                trang_thai_dk: 'tu_choi',
                ghi_chu: reason
            }
        }) as Promise<Registration>;
    }
}

// Singleton instance
export const registrationService = new RegistrationService();
export default registrationService;
