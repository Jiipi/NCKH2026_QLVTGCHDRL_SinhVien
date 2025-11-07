const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  try {
    // Tìm SV Dang Van Ha
    const sv = await prisma.sinhVien.findFirst({
      where: {
        nguoi_dung: {
          ho_ten: {
            contains: 'Dang Van Ha',
            mode: 'insensitive'
          }
        }
      },
      include: {
        nguoi_dung: true,
        lop: {
          include: {
            chu_nhiem_rel: true
          }
        }
      }
    });

    if (!sv) {
      console.log('❌ Không tìm thấy SV Dang Van Ha');
      return;
    }

    console.log('\n===== THÔNG TIN SV =====');
    console.log('MSSV:', sv.mssv);
    console.log('Họ tên:', sv.nguoi_dung?.ho_ten);
    console.log('Lớp:', sv.lop?.ten_lop);
    console.log('Khoa:', sv.lop?.khoa);
    console.log('GVCN ID:', sv.lop?.chu_nhiem);

    // Lấy danh sách người tạo hoạt động hợp lệ (chỉ lớp)
    const allClassStudents = await prisma.sinhVien.findMany({
      where: { lop_id: sv.lop_id },
      select: { nguoi_dung_id: true }
    });
    
    const classCreators = allClassStudents.map(s => s.nguoi_dung_id).filter(Boolean);
    if (sv.lop.chu_nhiem) {
      classCreators.push(sv.lop.chu_nhiem);
    }

    console.log('\n===== NGƯỜI TẠO HĐ HỢP LỆ (CHỈ LỚP) =====');
    console.log('Số người tạo hợp lệ:', classCreators.length);

    // HK1 2025-2026
    const hk1_2025 = {
      hoc_ky: 'hoc_ky_1',
      nam_hoc: '2025-2026'
    };

    // Đăng ký của SV
    const myRegs = await prisma.dangKyHoatDong.findMany({
      where: {
        sv_id: sv.id,
        hoat_dong: {
          ...hk1_2025,
          nguoi_tao_id: { in: classCreators }
        }
      },
      include: {
        hoat_dong: {
          include: {
            loai_hd: true
          }
        }
      }
    });

    console.log('\n===== ĐĂNG KÝ CỦA SV (HK1 2025-2026, CHỈ LỚP) =====');
    console.log('Tổng đăng ký:', myRegs.length);
    myRegs.forEach(r => {
      console.log(`- ${r.hoat_dong.ten_hd} | Trạng thái: ${r.trang_thai_dk} | Điểm: ${r.hoat_dong.diem_rl}`);
    });

    const participated = myRegs.filter(r => 
      r.trang_thai_dk === 'da_tham_gia' || r.trang_thai_dk === 'da_duyet'
    );
    console.log('\nĐã tham gia/duyệt:', participated.length);

    // Điểm danh QR
    const attendances = await prisma.diemDanh.findMany({
      where: {
        sv_id: sv.id,
        xac_nhan_tham_gia: true,
        hoat_dong: {
          ...hk1_2025,
          nguoi_tao_id: { in: classCreators }
        }
      },
      include: {
        hoat_dong: true
      }
    });

    console.log('\n===== ĐIỂM DANH QR THÀNH CÔNG =====');
    console.log('Số lần điểm danh:', attendances.length);
    attendances.forEach(a => {
      console.log(`- ${a.hoat_dong.ten_hd} | Điểm: ${a.hoat_dong.diem_rl}`);
    });

    // Tính điểm hợp lệ (đã tham gia + có QR)
    const hdIdsWithQR = new Set(attendances.map(a => a.hd_id));
    const validForPoints = participated.filter(r => hdIdsWithQR.has(r.hd_id));

    console.log('\n===== HĐ HỢP LỆ TÍNH ĐIỂM (ĐÃ THAM GIA + CÓ QR) =====');
    console.log('Số HĐ:', validForPoints.length);
    
    let totalPoints = 0;
    validForPoints.forEach(r => {
      const pts = Number(r.hoat_dong.diem_rl || 0);
      totalPoints += pts;
      console.log(`- ${r.hoat_dong.ten_hd} | Điểm: ${pts}`);
    });
    
    console.log('\n🏆 TỔNG ĐIỂM:', totalPoints);

    // Hoạt động sắp tới
    const upcoming = await prisma.hoatDong.findMany({
      where: {
        trang_thai: 'da_duyet',
        ngay_bd: { gte: new Date() },
        nguoi_tao_id: { in: classCreators },
        ...hk1_2025
      },
      select: {
        id: true,
        ten_hd: true,
        ngay_bd: true
      }
    });

    console.log('\n===== HOẠT ĐỘNG SẮP TỚI (ĐÃ DUYỆT, LỚP) =====');
    console.log('Số HĐ sắp tới:', upcoming.length);
    upcoming.forEach(h => {
      console.log(`- ${h.ten_hd} | Ngày: ${h.ngay_bd.toLocaleDateString('vi-VN')}`);
    });

    // Rank trong lớp
    console.log('\n===== RANK TRONG LỚP =====');
    const classmates = await prisma.sinhVien.findMany({
      where: { lop_id: sv.lop_id },
      include: {
        nguoi_dung: { select: { ho_ten: true } },
        dang_ky_hd: {
          where: {
            trang_thai_dk: { in: ['da_tham_gia', 'da_duyet'] },
            hoat_dong: {
              ...hk1_2025,
              nguoi_tao_id: { in: classCreators }
            }
          },
          include: {
            hoat_dong: true
          }
        }
      }
    });

    console.log('Tổng SV trong lớp:', classmates.length);

    // Tính điểm cho từng SV
    const scores = await Promise.all(
      classmates.map(async (c) => {
        const cAttendances = await prisma.diemDanh.findMany({
          where: {
            sv_id: c.id,
            xac_nhan_tham_gia: true,
            hoat_dong: {
              ...hk1_2025,
              nguoi_tao_id: { in: classCreators }
            }
          },
          include: { hoat_dong: true }
        });

        const cQRIds = new Set(cAttendances.map(a => a.hd_id));
        const cValid = c.dang_ky_hd.filter(r => cQRIds.has(r.hd_id));
        const cPoints = cValid.reduce((s, r) => s + Number(r.hoat_dong.diem_rl || 0), 0);

        return {
          mssv: c.mssv,
          ho_ten: c.nguoi_dung?.ho_ten || 'N/A',
          points: cPoints,
          isCurrent: c.id === sv.id
        };
      })
    );

    scores.sort((a, b) => b.points - a.points);
    const myRank = scores.findIndex(s => s.isCurrent) + 1;

    console.log(`\n🎯 Hạng của SV: ${myRank}/${classmates.length}`);
    console.log('\nTop 5:');
    scores.slice(0, 5).forEach((s, i) => {
      const marker = s.isCurrent ? ' 👉 (BẠN)' : '';
      console.log(`${i + 1}. ${s.mssv} - ${s.ho_ten} - ${s.points} điểm${marker}`);
    });

    // Xếp loại
    console.log('\n===== XẾP LOẠI =====');
    let classification = 'Yếu';
    let pointsNeeded = 0;
    
    if (totalPoints >= 90) {
      classification = 'Xuất sắc';
      pointsNeeded = 0;
    } else if (totalPoints >= 80) {
      classification = 'Giỏi';
      pointsNeeded = 90 - totalPoints;
    } else if (totalPoints >= 70) {
      classification = 'Khá';
      pointsNeeded = 80 - totalPoints;
    } else if (totalPoints >= 50) {
      classification = 'Trung bình';
      pointsNeeded = 70 - totalPoints;
    } else {
      classification = 'Yếu';
      pointsNeeded = 50 - totalPoints;
    }

    console.log('Xếp loại hiện tại:', classification);
    console.log('Điểm cần đạt thêm:', pointsNeeded > 0 ? pointsNeeded : 0);
    console.log('\nNgưỡng xếp loại:');
    console.log('- Yếu: < 50 điểm');
    console.log('- Trung bình: 50-69 điểm');
    console.log('- Khá: 70-79 điểm');
    console.log('- Giỏi: 80-89 điểm');
    console.log('- Xuất sắc: 90-100 điểm');

  } catch (error) {
    console.error('❌ Lỗi:', error.message);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

main();
