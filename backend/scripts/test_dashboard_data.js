const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function testDashboardAPI() {
  try {
    console.log('\n🔍 TEST DASHBOARD API - KIỂM TRA DỮ LIỆU\n');

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
        lop: true
      }
    });

    if (!sv) {
      console.log('❌ Không tìm thấy SV');
      return;
    }

    console.log('✅ SV:', sv.nguoi_dung.ho_ten, '- MSSV:', sv.mssv);
    console.log('✅ Lớp:', sv.lop.ten_lop, '- Tổng SV:', 53);

    // Lấy class creators
    const allClassStudents = await prisma.sinhVien.findMany({
      where: { lop_id: sv.lop_id },
      select: { nguoi_dung_id: true }
    });
    
    const classCreators = allClassStudents.map(s => s.nguoi_dung_id).filter(Boolean);
    if (sv.lop.chu_nhiem) {
      classCreators.push(sv.lop.chu_nhiem);
    }

    const hk1_2025 = {
      hoc_ky: 'hoc_ky_1',
      nam_hoc: '2025-2026'
    };

    // 1. Kiểm tra số hoạt động ĐÃ THAM GIA + CÓ QR
    const registrations = await prisma.dangKyHoatDong.findMany({
      where: {
        sv_id: sv.id,
        trang_thai_dk: { in: ['da_tham_gia', 'da_duyet'] },
        hoat_dong: {
          ...hk1_2025,
          nguoi_tao_id: { in: classCreators }
        }
      },
      include: {
        hoat_dong: true
      }
    });

    const attendances = await prisma.diemDanh.findMany({
      where: {
        sv_id: sv.id,
        xac_nhan_tham_gia: true,
        hoat_dong: {
          ...hk1_2025,
          nguoi_tao_id: { in: classCreators }
        }
      }
    });

    const hdIdsWithQR = new Set(attendances.map(a => a.hd_id));
    const validForPoints = registrations.filter(r => hdIdsWithQR.has(r.hd_id));

    console.log('\n📊 KẾT QUẢ KIỂM TRA:');
    console.log('=' .repeat(60));
    console.log('1. Số hoạt động ĐÃ THAM GIA + CÓ QR:', validForPoints.length);
    console.log('   (Backend phải trả: tong_hoat_dong =', validForPoints.length + ')');

    // 2. Kiểm tra tổng điểm
    const totalPoints = validForPoints.reduce((s, r) => s + Number(r.hoat_dong.diem_rl || 0), 0);
    console.log('\n2. Tổng điểm:', totalPoints);
    console.log('   (Backend phải trả: tong_diem =', totalPoints + ')');

    // 3. Kiểm tra rank
    const classmates = await prisma.sinhVien.findMany({
      where: { lop_id: sv.lop_id },
      select: { id: true, mssv: true }
    });

    const scores = await Promise.all(
      classmates.map(async (c) => {
        const cRegs = await prisma.dangKyHoatDong.findMany({
          where: {
            sv_id: c.id,
            trang_thai_dk: { in: ['da_tham_gia', 'da_duyet'] },
            hoat_dong: {
              ...hk1_2025,
              nguoi_tao_id: { in: classCreators }
            }
          },
          include: { hoat_dong: true }
        });

        const cAttendances = await prisma.diemDanh.findMany({
          where: {
            sv_id: c.id,
            xac_nhan_tham_gia: true,
            hoat_dong: {
              ...hk1_2025,
              nguoi_tao_id: { in: classCreators }
            }
          }
        });

        const cHdIdsWithQR = new Set(cAttendances.map(a => a.hd_id));
        const cValid = cRegs.filter(r => cHdIdsWithQR.has(r.hd_id));
        const cPoints = cValid.reduce((s, r) => s + Number(r.hoat_dong.diem_rl || 0), 0);

        return {
          mssv: c.mssv,
          points: cPoints,
          isCurrent: c.id === sv.id
        };
      })
    );

    scores.sort((a, b) => b.points - a.points);
    const myRank = scores.findIndex(s => s.isCurrent) + 1;
    const totalStudents = classmates.length;

    console.log('\n3. Rank trong lớp:', myRank, '/', totalStudents);
    console.log('   (Backend phải trả: my_rank_in_class =', myRank + ', total_students_in_class =', totalStudents + ')');

    // 4. Xếp loại
    let xepLoai = 'Yếu';
    if (totalPoints >= 90) xepLoai = 'Xuất sắc';
    else if (totalPoints >= 80) xepLoai = 'Giỏi';
    else if (totalPoints >= 70) xepLoai = 'Khá';
    else if (totalPoints >= 50) xepLoai = 'Trung bình';

    console.log('\n4. Xếp loại:', xepLoai);
    console.log('   (Backend phải trả: xep_loai =', xepLoai + ')');

    // 5. Hoạt động sắp tới
    const upcoming = await prisma.hoatDong.findMany({
      where: {
        trang_thai: 'da_duyet',
        ngay_bd: { gte: new Date() },
        nguoi_tao_id: { in: classCreators },
        ...hk1_2025
      }
    });

    console.log('\n5. Hoạt động sắp tới:', upcoming.length);
    console.log('   (Backend phải trả: hoat_dong_sap_toi.length =', upcoming.length + ')');

    console.log('\n' + '='.repeat(60));
    console.log('\n✅ DASHBOARD PHẢI TRẢ VỀ:');
    console.log(JSON.stringify({
      tong_quan: {
        tong_diem: totalPoints,
        tong_hoat_dong: validForPoints.length,
        xep_loai: xepLoai,
        muc_tieu: 100
      },
      so_sanh_lop: {
        my_rank_in_class: myRank,
        total_students_in_class: totalStudents
      },
      hoat_dong_sap_toi: `[${upcoming.length} items]`
    }, null, 2));

    console.log('\n📋 FRONTEND SẼ HIỂN THỊ:');
    console.log('- Đã tham gia:', validForPoints.length, 'hoạt động');
    console.log('- Sắp tới:', upcoming.length, 'hoạt động');
    console.log('- Hạng:', myRank + '/' + totalStudents);
    console.log('- Tổng điểm:', totalPoints);
    console.log('- Xếp loại:', xepLoai);

  } catch (error) {
    console.error('❌ Lỗi:', error.message);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

testDashboardAPI();
