const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

/**
 * Gửi thông báo yêu cầu phê duyệt vào lớp cho Lớp trưởng và Admin
 */
async function sendClassApprovalRequest({ studentId, studentName, studentMSSV, classId, className }) {
  try {
    // 1. Tìm loại thông báo (hoặc tạo mới nếu chưa có)
    let notificationType = await prisma.loaiThongBao.findFirst({
      where: { ten_loai_tb: 'Yêu cầu phê duyệt lớp' }
    });

    if (!notificationType) {
      notificationType = await prisma.loaiThongBao.create({
        data: {
          ten_loai_tb: 'Yêu cầu phê duyệt lớp',
          mo_ta: 'Thông báo khi sinh viên đăng ký vào lớp cần được phê duyệt'
        }
      });
    }

    // 2. Tìm thông tin lớp và lớp trưởng
    const classInfo = await prisma.lop.findUnique({
      where: { id: classId },
      include: {
        lop_truong_rel: {
          include: {
            nguoi_dung: true
          }
        }
      }
    });

    // 3. Tìm tất cả admin
    const adminRole = await prisma.vaiTro.findFirst({
      where: { ten_vt: 'ADMIN' }
    });

    const admins = adminRole ? await prisma.nguoiDung.findMany({
      where: { vai_tro_id: adminRole.id },
      select: { id: true, ho_ten: true }
    }) : [];

    console.log(`📋 Lớp: ${className}, Lớp trưởng: ${classInfo?.lop_truong ? 'Có' : 'Không'}, Admins: ${admins.length}`);

    // 4. Tạo nội dung thông báo
    const title = `Yêu cầu phê duyệt: ${studentName} vào lớp ${className}`;
    const content = `Sinh viên ${studentName} (MSSV: ${studentMSSV}) đã đăng ký tài khoản và yêu cầu tham gia lớp ${className}. Vui lòng xem xét và phê duyệt.`;

    const notifications = [];

    // 5. Gửi thông báo cho Lớp trưởng (nếu có)
    if (classInfo?.lop_truong && classInfo?.lop_truong_rel?.nguoi_dung_id) {
      notifications.push({
        tieu_de: title,
        noi_dung: content,
        loai_tb_id: notificationType.id,
        nguoi_gui_id: studentId,
        nguoi_nhan_id: classInfo.lop_truong_rel.nguoi_dung_id,
        muc_do_uu_tien: 'cao',
        phuong_thuc_gui: 'trong_he_thong'
      });
      console.log(`  → Gửi cho Lớp trưởng: ${classInfo.lop_truong_rel.nguoi_dung.ho_ten}`);
    } else {
      console.log(`  ⚠️ Lớp ${className} chưa có lớp trưởng`);
    }

    // 6. Gửi thông báo cho tất cả Admin
    for (const admin of admins) {
      notifications.push({
        tieu_de: title,
        noi_dung: content,
        loai_tb_id: notificationType.id,
        nguoi_gui_id: studentId,
        nguoi_nhan_id: admin.id,
        muc_do_uu_tien: 'cao',
        phuong_thuc_gui: 'trong_he_thong'
      });
    }

    // 7. Tạo tất cả thông báo
    if (notifications.length > 0) {
      await prisma.thongBao.createMany({
        data: notifications
      });

      console.log(`✅ Đã gửi ${notifications.length} thông báo phê duyệt cho sinh viên ${studentMSSV}`);
    }

    return {
      success: true,
      message: `Đã gửi ${notifications.length} thông báo`,
      recipients: notifications.length
    };

  } catch (error) {
    console.error('❌ Lỗi khi gửi thông báo:', error);
    throw error;
  }
}

module.exports = {
  sendClassApprovalRequest
};
