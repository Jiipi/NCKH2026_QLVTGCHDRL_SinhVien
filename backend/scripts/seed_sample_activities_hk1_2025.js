const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  try {
    console.log('\n🚀 SEED DỮ LIỆU MẪU HK1 2025-2026\n');

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
      console.log('❌ Không tìm thấy SV Dang Van Ha');
      return;
    }

    console.log('✅ Tìm thấy SV:', sv.nguoi_dung.ho_ten, '- MSSV:', sv.mssv);
    console.log('✅ Lớp:', sv.lop.ten_lop);

    // Lấy GVCN
    const gvcnId = sv.lop.chu_nhiem;
    console.log('✅ GVCN ID:', gvcnId);

    // Lấy các loại hoạt động
    const loaiHocTap = await prisma.loaiHoatDong.findFirst({
      where: { ten_loai_hd: { contains: 'Học tập', mode: 'insensitive' } }
    });
    
    const loaiTinhNguyen = await prisma.loaiHoatDong.findFirst({
      where: { ten_loai_hd: { contains: 'Tình nguyện', mode: 'insensitive' } }
    });

    const loaiNoiQuy = await prisma.loaiHoatDong.findFirst({
      where: { ten_loai_hd: { contains: 'Nội quy', mode: 'insensitive' } }
    });

    if (!loaiHocTap || !loaiTinhNguyen || !loaiNoiQuy) {
      console.log('❌ Không tìm thấy các loại hoạt động cần thiết');
      console.log('Vui lòng tạo các loại: Học tập, Tình nguyện, Nội quy trong Prisma Studio');
      return;
    }

    console.log('\n📝 TẠO HOẠT ĐỘNG MẪU...\n');

    // Tạo hoạt động đã diễn ra (để tính điểm)
    const activities = [];

    // 1. Hoạt động Học tập (10 điểm) - Đã diễn ra
    const hd1 = await prisma.hoatDong.create({
      data: {
        ma_hd: 'HD-HK1-2025-001',
        ten_hd: 'Hội thảo Học tập và Nghiên cứu Khoa học',
        mo_ta: 'Hội thảo về phương pháp học tập hiệu quả và nghiên cứu khoa học cho sinh viên',
        loai_hd_id: loaiHocTap.id,
        diem_rl: 10.0,
        dia_diem: 'Hội trường A1',
        ngay_bd: new Date('2025-09-15T08:00:00'),
        ngay_kt: new Date('2025-09-15T11:00:00'),
        han_dk: new Date('2025-09-10T23:59:59'),
        sl_toi_da: 100,
        don_vi_to_chuc: sv.lop.khoa,
        trang_thai: 'da_duyet',
        nguoi_tao_id: gvcnId,
        hoc_ky: 'hoc_ky_1',
        nam_hoc: '2025-2026',
        qr: generateQR(),
        hinh_anh: [],
        tep_dinh_kem: []
      }
    });
    activities.push(hd1);
    console.log('✅ Tạo hoạt động:', hd1.ten_hd);

    // 2. Hoạt động Tình nguyện (8 điểm) - Đã diễn ra
    const hd2 = await prisma.hoatDong.create({
      data: {
        ma_hd: 'HD-HK1-2025-002',
        ten_hd: 'Chiến dịch Xuân tình nguyện 2025',
        mo_ta: 'Hoạt động tình nguyện hỗ trợ cộng đồng, dọn dẹp môi trường',
        loai_hd_id: loaiTinhNguyen.id,
        diem_rl: 8.0,
        dia_diem: 'Xã Đông Hưng, Huyện Bắc Giang',
        ngay_bd: new Date('2025-10-01T07:00:00'),
        ngay_kt: new Date('2025-10-01T17:00:00'),
        han_dk: new Date('2025-09-25T23:59:59'),
        sl_toi_da: 50,
        don_vi_to_chuc: 'Đoàn trường',
        trang_thai: 'da_duyet',
        nguoi_tao_id: gvcnId,
        hoc_ky: 'hoc_ky_1',
        nam_hoc: '2025-2026',
        qr: generateQR(),
        hinh_anh: [],
        tep_dinh_kem: []
      }
    });
    activities.push(hd2);
    console.log('✅ Tạo hoạt động:', hd2.ten_hd);

    // 3. Hoạt động Nội quy (5 điểm) - Đã diễn ra
    const hd3 = await prisma.hoatDong.create({
      data: {
        ma_hd: 'HD-HK1-2025-003',
        ten_hd: 'Sinh hoạt lớp đầu năm học',
        mo_ta: 'Sinh hoạt lớp, phổ biến nội quy, quy chế đào tạo',
        loai_hd_id: loaiNoiQuy.id,
        diem_rl: 5.0,
        dia_diem: 'Phòng C101',
        ngay_bd: new Date('2025-09-05T14:00:00'),
        ngay_kt: new Date('2025-09-05T16:00:00'),
        han_dk: new Date('2025-09-03T23:59:59'),
        sl_toi_da: 60,
        don_vi_to_chuc: sv.lop.ten_lop,
        trang_thai: 'da_duyet',
        nguoi_tao_id: gvcnId,
        hoc_ky: 'hoc_ky_1',
        nam_hoc: '2025-2026',
        qr: generateQR(),
        hinh_anh: [],
        tep_dinh_kem: []
      }
    });
    activities.push(hd3);
    console.log('✅ Tạo hoạt động:', hd3.ten_hd);

    console.log('\n📝 TẠO HOẠT ĐỘNG SẮP TỚI...\n');

    // Tạo các hoạt động sắp tới
    const upcomingActivities = [];

    for (let i = 1; i <= 6; i++) {
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + (i * 7)); // Mỗi hoạt động cách nhau 1 tuần

      const loai = i % 3 === 0 ? loaiHocTap : i % 3 === 1 ? loaiTinhNguyen : loaiNoiQuy;
      const tenLoai = i % 3 === 0 ? 'Học tập' : i % 3 === 1 ? 'Tình nguyện' : 'Nội quy';

      const hdSapToi = await prisma.hoatDong.create({
        data: {
          ma_hd: `HD-HK1-2025-${String(i + 3).padStart(3, '0')}`,
          ten_hd: `Hoạt động ${tenLoai} - Tuần ${i}`,
          mo_ta: `Mô tả hoạt động ${tenLoai} sắp tới`,
          loai_hd_id: loai.id,
          diem_rl: 5.0 + (i * 0.5),
          dia_diem: `Phòng ${String.fromCharCode(65 + i)}${i}01`,
          ngay_bd: futureDate,
          ngay_kt: new Date(futureDate.getTime() + 3 * 60 * 60 * 1000), // +3 giờ
          han_dk: new Date(futureDate.getTime() - 2 * 24 * 60 * 60 * 1000), // -2 ngày
          sl_toi_da: 50,
          don_vi_to_chuc: sv.lop.khoa,
          trang_thai: 'da_duyet',
          nguoi_tao_id: gvcnId,
          hoc_ky: 'hoc_ky_1',
          nam_hoc: '2025-2026',
          qr: generateQR(),
          hinh_anh: [],
          tep_dinh_kem: []
        }
      });
      upcomingActivities.push(hdSapToi);
      console.log(`✅ Tạo hoạt động sắp tới ${i}/6:`, hdSapToi.ten_hd);
    }

    console.log('\n📝 TẠO ĐĂNG KÝ CHO SV...\n');

    // Tạo đăng ký cho 3 hoạt động đã diễn ra
    const registrations = [];
    for (const hd of activities) {
      const reg = await prisma.dangKyHoatDong.create({
        data: {
          sv_id: sv.id,
          hd_id: hd.id,
          ngay_dang_ky: new Date(hd.ngay_bd.getTime() - 5 * 24 * 60 * 60 * 1000), // -5 ngày trước hoạt động
          trang_thai_dk: 'da_tham_gia',
          ly_do_dk: 'Đăng ký tham gia hoạt động',
          ngay_duyet: new Date(hd.ngay_bd.getTime() - 3 * 24 * 60 * 60 * 1000)
        }
      });
      registrations.push(reg);
      console.log('✅ Tạo đăng ký cho:', hd.ten_hd);
    }

    console.log('\n📝 TẠO ĐIỂM DANH QR CHO SV...\n');

    // Tạo điểm danh QR cho 3 hoạt động đã tham gia
    const attendances = [];
    for (const hd of activities) {
      const attendance = await prisma.diemDanh.create({
        data: {
          nguoi_diem_danh_id: gvcnId,
          sv_id: sv.id,
          hd_id: hd.id,
          tg_diem_danh: new Date(hd.ngay_bd.getTime() + 30 * 60 * 1000), // +30 phút sau khi bắt đầu
          phuong_thuc: 'qr',
          trang_thai_tham_gia: 'co_mat',
          xac_nhan_tham_gia: true,
          ghi_chu: 'Điểm danh QR thành công'
        }
      });
      attendances.push(attendance);
      console.log('✅ Tạo điểm danh QR cho:', hd.ten_hd);
    }

    // Tính tổng điểm
    const tongDiem = activities.reduce((sum, hd) => sum + Number(hd.diem_rl), 0);

    console.log('\n✨ HOÀN THÀNH SEED DỮ LIỆU!\n');
    console.log('=' .repeat(50));
    console.log('📊 THỐNG KÊ:');
    console.log('- Tổng hoạt động đã tạo:', activities.length + upcomingActivities.length);
    console.log('- Hoạt động đã tham gia:', activities.length);
    console.log('- Hoạt động sắp tới:', upcomingActivities.length);
    console.log('- Tổng điểm rèn luyện:', tongDiem);
    console.log('=' .repeat(50));
    console.log('\n🎯 Xếp loại dự kiến:');
    console.log('- Yếu: < 50 điểm');
    console.log('- Trung bình: 50-69 điểm');
    console.log('- Khá: 70-79 điểm');
    console.log('- Giỏi: 80-89 điểm');
    console.log('- Xuất sắc: 90-100 điểm');
    console.log(`\n📍 SV hiện có: ${tongDiem} điểm → Xếp loại: ${getClassification(tongDiem)}\n`);

  } catch (error) {
    console.error('❌ Lỗi:', error.message);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

function generateQR() {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
}

function getClassification(points) {
  if (points >= 90) return 'Xuất sắc';
  if (points >= 80) return 'Giỏi';
  if (points >= 70) return 'Khá';
  if (points >= 50) return 'Trung bình';
  return 'Yếu';
}

main();
