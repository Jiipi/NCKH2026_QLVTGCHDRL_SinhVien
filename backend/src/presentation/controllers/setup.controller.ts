import { Request, Response } from 'express';
import { prisma } from '../../data/infrastructure/prisma/client';
import { ApiResponse, sendResponse } from '../../core/http/response/apiResponse';
import bcrypt from 'bcryptjs';
import { logInfo, logError } from '../../core/logger';

export class SetupController {
    async setupAdmin(req: Request, res: Response) {
        try {
            const adminPassword = process.env.SETUP_ADMIN_PASSWORD;
            const adminUsername = process.env.SETUP_ADMIN_USERNAME || 'admin';
            const adminEmail = process.env.SETUP_ADMIN_EMAIL || 'admin@hoatdongrenluyen.io.vn';
            const adminFullName = process.env.SETUP_ADMIN_FULLNAME || 'Administrator';

            if (!adminPassword || adminPassword.trim().length < 8) {
                return sendResponse(
                    res,
                    500,
                    ApiResponse.error('SETUP_ADMIN_PASSWORD is missing or too short (min 8 chars)')
                );
            }

            logInfo('Starting secure setup-admin flow');

            // 1. Create Roles
            const roles = [
                { ten_vt: 'ADMIN', mo_ta: 'Quản trị viên hệ thống' },
                { ten_vt: 'GIANG_VIEN', mo_ta: 'Giảng viên/Cố vấn học tập' },
                { ten_vt: 'LOP_TRUONG', mo_ta: 'Lớp trưởng/Ban cán sự' },
                { ten_vt: 'SINH_VIEN', mo_ta: 'Sinh viên' },
            ];

            for (const role of roles) {
                await prisma.vaiTro.upsert({
                    where: { ten_vt: role.ten_vt },
                    update: {},
                    create: role,
                });
            }

            // 2. Create Admin
            const adminRole = await prisma.vaiTro.findUnique({ where: { ten_vt: 'ADMIN' } });

            if (!adminRole) {
                return sendResponse(res, 500, ApiResponse.error('Failed to create roles'));
            }

            const hashedPassword = await bcrypt.hash(adminPassword, 10);

            const admin = await prisma.nguoiDung.upsert({
                where: { ten_dn: adminUsername },
                update: {
                    mat_khau: hashedPassword // Reset password if exists
                },
                create: {
                    ten_dn: adminUsername,
                    mat_khau: hashedPassword,
                    email: adminEmail,
                    ho_ten: adminFullName,
                    vai_tro_id: adminRole.id,
                    trang_thai: 'hoat_dong',
                },
            });

            return sendResponse(res, 200, ApiResponse.success({
                user: admin.ten_dn,
                role: 'ADMIN',
                status: 'Created/Updated'
            }, 'Admin setup successful'));

        } catch (error) {
            logError('Setup admin failed', error);
            return sendResponse(res, 500, ApiResponse.error('Setup failed: ' + (error as Error).message));
        }
    }
}
