import { Request, Response } from 'express';
import { prisma } from '../../data/infrastructure/prisma/client';
import { ApiResponse, sendResponse } from '../../core/http/response/apiResponse';
import bcrypt from 'bcryptjs';

export class SetupController {
    async setupAdmin(req: Request, res: Response) {
        try {
            console.log('Starting manual setup...');

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

            const hashedPassword = await bcrypt.hash('123456', 10);

            const admin = await prisma.nguoiDung.upsert({
                where: { ten_dn: 'admin' },
                update: {
                    mat_khau: hashedPassword // Reset password if exists
                },
                create: {
                    ten_dn: 'admin',
                    mat_khau: hashedPassword,
                    email: 'admin@hoatdongrenluyen.io.vn',
                    ho_ten: 'Administrator',
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
            console.error('Setup error:', error);
            return sendResponse(res, 500, ApiResponse.error('Setup failed: ' + (error as Error).message));
        }
    }
}
