/**
 * Script: Seed dữ liệu đầy đủ cho hệ thống
 * 
 * YÊU CẦU:
 * - 1 lớp có 50 sinh viên
 * - Mỗi sinh viên đăng ký tối thiểu 20 hoạt động
 * - Mỗi sinh viên có 50-100 điểm rèn luyện
 * - Mỗi sinh viên có ít nhất 10 hoạt động chờ phê duyệt
 * - Hoạt động phải đúng logic: chỉ sinh viên trong lớp mới đăng ký được
 * - Bổ sung đầy đủ các trường còn thiếu trong database
 * 
 * Cách chạy:
 *   cd backend
 *   node scripts/seed_complete_data.js
 */

require('dotenv').config();

const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

// Hằng số
const STUDENTS_PER_CLASS = 50;
const MIN_ACTIVITIES_PER_STUDENT = 20;
const MIN_PENDING_PER_STUDENT = 10;
const MIN_POINTS = 50;
const MAX_POINTS = 100;
const ACTIVITIES_PER_CLASS = 60; // Để đủ cho sinh viên đăng ký

// Helper functions
function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randomElement(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function randomDate(start, end) {
  return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
}

function generateMSSV(classYear, index) {
  return `${classYear}${String(index).padStart(3, '0')}`;
}

function generateHoTen() {
  const ho = ['Nguyễn', 'Trần', 'Lê', 'Phạm', 'Hoàng', 'Huỳnh', 'Phan', 'Vũ', 'Võ', 'Đặng', 'Bùi', 'Đỗ', 'Hồ', 'Ngô', 'Dương'];
  const tenDem = ['Văn', 'Thị', 'Hữu', 'Đức', 'Minh', 'Quốc', 'Anh', 'Thanh', 'Hồng', 'Thu', 'Phương', 'Ngọc'];
  const ten = ['Hùng', 'Dũng', 'Linh', 'Hương', 'Mai', 'Lan', 'Hải', 'Long', 'Tuấn', 'Hiếu', 'Nam', 'An', 'Bình', 'Chi', 'Đạt', 'Giang', 'Khánh', 'Phúc', 'Tâm', 'Việt'];
  
  return `${randomElement(ho)} ${randomElement(tenDem)} ${randomElement(ten)}`;
}

function generatePhoneNumber() {
  const prefixes = ['090', '091', '093', '094', '097', '098', '086', '088', '089'];
  return `${randomElement(prefixes)}${randomInt(1000000, 9999999)}`;
}

function generateAddress() {
  const streets = ['Lê Lợi', 'Nguyễn Huệ', 'Trần Hưng Đạo', 'Hai Bà Trưng', 'Lý Thường Kiệt', 'Võ Văn Tần', 'Pasteur', 'Điện Biên Phủ'];
  const districts = ['Quận 1', 'Quận 3', 'Quận 5', 'Quận 7', 'Quận 10', 'Thủ Đức', 'Bình Thạnh', 'Gò Vấp'];
  return `${randomInt(1, 500)} ${randomElement(streets)}, ${randomElement(districts)}, TP.HCM`;
}

async function main() {
  console.log('🚀 BẮT ĐẦU SEED DỮ LIỆU ĐẦY ĐỦ\n');
  console.log('='.repeat(60));

  try {
    // 1. Lấy hoặc tạo vai trò
    console.log('\n📋 Bước 1: Kiểm tra vai trò...');
    let roleStudent = await prisma.vaiTro.findFirst({ where: { ten_vt: 'SINH_VIEN' } });
    let roleMonitor = await prisma.vaiTro.findFirst({ where: { ten_vt: 'LOP_TRUONG' } });
    let roleTeacher = await prisma.vaiTro.findFirst({ where: { ten_vt: 'GIANG_VIEN' } });

    if (!roleStudent || !roleMonitor || !roleTeacher) {
      console.log('   ❌ Thiếu vai trò. Vui lòng chạy seed cơ bản trước!');
      return;
    }

    console.log(`   ✅ Vai trò: SINH_VIEN, LOP_TRUONG, GIANG_VIEN`);

    // 2. Lấy hoặc tạo loại hoạt động
    console.log('\n📋 Bước 2: Kiểm tra loại hoạt động...');
    const activityTypes = await prisma.loaiHoatDong.findMany();
    
    if (activityTypes.length === 0) {
      console.log('   ⚠️  Không có loại hoạt động. Tạo mới...');
      const typesData = [
        { ten_loai_hd: 'Học tập', mo_ta: 'Hoạt động học tập, nghiên cứu khoa học', diem_mac_dinh: 5, diem_toi_da: 10 },
        { ten_loai_hd: 'Thể thao', mo_ta: 'Hoạt động thể dục thể thao', diem_mac_dinh: 3, diem_toi_da: 8 },
        { ten_loai_hd: 'Văn hóa', mo_ta: 'Hoạt động văn hóa văn nghệ', diem_mac_dinh: 4, diem_toi_da: 8 },
        { ten_loai_hd: 'Tình nguyện', mo_ta: 'Hoạt động tình nguyện cộng đồng', diem_mac_dinh: 4, diem_toi_da: 10 },
        { ten_loai_hd: 'Kỹ năng', mo_ta: 'Hoạt động rèn luyện kỹ năng mềm', diem_mac_dinh: 3, diem_toi_da: 6 },
      ];

      for (const type of typesData) {
        await prisma.loaiHoatDong.create({ data: type });
      }
      
      const newTypes = await prisma.loaiHoatDong.findMany();
      console.log(`   ✅ Đã tạo ${newTypes.length} loại hoạt động`);
    } else {
      console.log(`   ✅ Đã có ${activityTypes.length} loại hoạt động`);
    }

    // 3. Lấy giảng viên
    console.log('\n📋 Bước 3: Lấy giảng viên...');
    const teacher = await prisma.nguoiDung.findFirst({
      where: { vai_tro_id: roleTeacher.id }
    });

    if (!teacher) {
      console.log('   ❌ Không tìm thấy giảng viên. Vui lòng tạo giảng viên trước!');
      return;
    }

    console.log(`   ✅ Giảng viên: ${teacher.ten_dn}`);

    // 4. Tạo lớp mới
    console.log('\n📋 Bước 4: Tạo lớp học...');
    const classYear = 2021;
    const className = `CNTT${classYear}K16`;
    
    let classData = await prisma.lop.findFirst({ where: { ten_lop: className } });
    
    if (!classData) {
      classData = await prisma.lop.create({
        data: {
          ten_lop: className,
          khoa: 'Công nghệ thông tin',
          nien_khoa: `${classYear}-${classYear + 4}`,
          nam_nhap_hoc: new Date(`${classYear}-09-01`),
          nam_tot_nghiep: new Date(`${classYear + 4}-06-30`),
          chu_nhiem: teacher.id
        }
      });
      console.log(`   ✅ Đã tạo lớp: ${className}`);
    } else {
      console.log(`   ℹ️  Lớp ${className} đã tồn tại`);
    }

    // 5. Tạo sinh viên
    console.log(`\n📋 Bước 5: Tạo ${STUDENTS_PER_CLASS} sinh viên...`);
    const hashedPassword = await bcrypt.hash('123456', 10);
    const students = [];
    let monitorStudent = null;

    for (let i = 1; i <= STUDENTS_PER_CLASS; i++) {
      const mssv = generateMSSV(classYear, i);
      const hoTen = generateHoTen();
      const email = `${mssv}@student.edu.vn`;
      const isMonitor = i === 1; // Sinh viên đầu tiên là lớp trưởng

      // Kiểm tra xem người dùng đã tồn tại chưa
      let user = await prisma.nguoiDung.findFirst({ where: { ten_dn: mssv } });
      
      if (!user) {
        user = await prisma.nguoiDung.create({
          data: {
            ten_dn: mssv,
            mat_khau: hashedPassword,
            email: email,
            ho_ten: hoTen,
            vai_tro_id: isMonitor ? roleMonitor.id : roleStudent.id,
            trang_thai: 'hoat_dong'
          }
        });
      }

      // Kiểm tra xem sinh viên đã tồn tại chưa
      let student = await prisma.sinhVien.findFirst({ where: { mssv: mssv } });
      
      if (!student) {
        student = await prisma.sinhVien.create({
          data: {
            nguoi_dung_id: user.id,
            mssv: mssv,
            ngay_sinh: new Date(`${classYear - 18}-${randomInt(1, 12)}-${randomInt(1, 28)}`),
            gt: randomElement(['nam', 'nu']),
            lop_id: classData.id,
            dia_chi: generateAddress(),
            sdt: generatePhoneNumber(),
            email: email
          }
        });
      }

      students.push(student);
      
      if (isMonitor) {
        monitorStudent = student;
      }

      if (i % 10 === 0) {
        console.log(`   ✅ Đã tạo ${i}/${STUDENTS_PER_CLASS} sinh viên`);
      }
    }

    // Cập nhật lớp trưởng cho lớp
    if (monitorStudent && !classData.lop_truong) {
      await prisma.lop.update({
        where: { id: classData.id },
        data: { lop_truong: monitorStudent.id }
      });
      console.log(`   ✅ Đã gán lớp trưởng: ${monitorStudent.mssv}`);
    }

    console.log(`   ✅ Hoàn tất tạo ${students.length} sinh viên`);

    // 6. Tạo hoạt động
    console.log(`\n📋 Bước 6: Tạo ${ACTIVITIES_PER_CLASS} hoạt động cho lớp...`);
    const types = await prisma.loaiHoatDong.findMany();
    const activities = [];
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth() + 1;
    
    // Xác định học kỳ hiện tại
    let hocKy, namHoc;
    if (currentMonth >= 9 || currentMonth <= 1) {
      hocKy = 'hoc_ky_1';
      namHoc = currentMonth >= 9 ? `${currentYear}-${currentYear + 1}` : `${currentYear - 1}-${currentYear}`;
    } else {
      hocKy = 'hoc_ky_2';
      namHoc = `${currentYear - 1}-${currentYear}`;
    }

    const activityNames = [
      'Hội thảo khoa học CNTT',
      'Thi lập trình ACM',
      'Workshop AI và Machine Learning',
      'Cuộc thi Hackathon',
      'Seminar công nghệ mới',
      'Giải bóng đá khoa CNTT',
      'Giải cầu lông sinh viên',
      'Chạy marathon từ thiện',
      'Yoga buổi sáng',
      'Bơi lội cuối tuần',
      'Đêm nhạc chào tân sinh viên',
      'Thi hát karaoke',
      'Biểu diễn múa truyền thống',
      'Triển lãm ảnh nghệ thuật',
      'Workshop guitar cơ bản',
      'Hiến máu nhân đạo',
      'Dọn dẹp bãi biển',
      'Thăm trại trẻ mồ côi',
      'Trao quà từ thiện',
      'Trồng cây xanh',
      'Kỹ năng thuyết trình',
      'Kỹ năng làm việc nhóm',
      'Kỹ năng quản lý thời gian',
      'Workshop CV và phỏng vấn',
      'Kỹ năng giao tiếp'
    ];

    for (let i = 0; i < ACTIVITIES_PER_CLASS; i++) {
      const type = randomElement(types);
      const activityName = randomElement(activityNames);
      const points = parseFloat((Math.random() * (type.diem_toi_da - type.diem_mac_dinh) + parseFloat(type.diem_mac_dinh)).toFixed(2));
      
      // 70% đã duyệt, 30% chờ duyệt
      const trangThai = Math.random() < 0.7 ? 'da_duyet' : 'cho_duyet';
      
      // Thời gian hoạt động trong 3 tháng gần đây
      const startDate = new Date(now.getTime() - randomInt(0, 90) * 24 * 60 * 60 * 1000);
      const endDate = new Date(startDate.getTime() + randomInt(2, 4) * 60 * 60 * 1000);
      const registrationDeadline = new Date(startDate.getTime() - randomInt(1, 3) * 24 * 60 * 60 * 1000);

      const activity = await prisma.hoatDong.create({
        data: {
          ma_hd: `HD${classYear}${String(i + 1).padStart(3, '0')}`,
          ten_hd: `${activityName} ${i + 1}`,
          mo_ta: `Mô tả chi tiết cho ${activityName}. Đây là hoạt động dành cho sinh viên lớp ${className}.`,
          loai_hd_id: type.id,
          diem_rl: points,
          dia_diem: randomElement(['Phòng A101', 'Phòng B202', 'Hội trường C', 'Sân vận động', 'Phòng thực hành 1', 'Phòng họp 2', 'Giảng đường lớn']),
          ngay_bd: startDate,
          ngay_kt: endDate,
          han_dk: registrationDeadline,
          sl_toi_da: randomInt(30, 50),
          don_vi_to_chuc: 'Khoa CNTT',
          yeu_cau_tham_gia: 'Sinh viên lớp ' + className,
          trang_thai: trangThai,
          nguoi_tao_id: Math.random() < 0.3 ? monitorStudent.nguoi_dung_id : teacher.id,
          co_chung_chi: Math.random() < 0.3,
          hoc_ky: hocKy,
          nam_hoc: namHoc,
          hinh_anh: [],
          tep_dinh_kem: []
        }
      });

      activities.push(activity);

      if ((i + 1) % 10 === 0) {
        console.log(`   ✅ Đã tạo ${i + 1}/${ACTIVITIES_PER_CLASS} hoạt động`);
      }
    }

    console.log(`   ✅ Hoàn tất tạo ${activities.length} hoạt động`);

    // 7. Tạo đăng ký hoạt động
    console.log(`\n📋 Bước 7: Tạo đăng ký hoạt động cho sinh viên...`);
    const approvedActivities = activities.filter(a => a.trang_thai === 'da_duyet');
    let registrationCount = 0;
    let attendanceCount = 0;

    for (const student of students) {
      // Mỗi sinh viên đăng ký 20-30 hoạt động
      const numToRegister = randomInt(MIN_ACTIVITIES_PER_STUDENT, MIN_ACTIVITIES_PER_STUDENT + 10);
      
      // Shuffle activities để random
      const shuffledActivities = [...approvedActivities].sort(() => Math.random() - 0.5);
      const selectedActivities = shuffledActivities.slice(0, Math.min(numToRegister, shuffledActivities.length));

      let studentPendingCount = 0;
      let studentPoints = 0;

      for (let j = 0; j < selectedActivities.length; j++) {
        const activity = selectedActivities[j];
        
        // Xác định trạng thái đăng ký
        let trangThaiDK;
        
        // Đảm bảo ít nhất 10 hoạt động chờ duyệt
        if (studentPendingCount < MIN_PENDING_PER_STUDENT && Math.random() < 0.6) {
          trangThaiDK = 'cho_duyet';
          studentPendingCount++;
        } else {
          // Phân bố còn lại: 70% đã duyệt, 20% đã tham gia, 10% từ chối
          const rand = Math.random();
          if (rand < 0.7) {
            trangThaiDK = 'da_duyet';
          } else if (rand < 0.9) {
            trangThaiDK = 'da_tham_gia';
            studentPoints += parseFloat(activity.diem_rl);
          } else {
            trangThaiDK = 'tu_choi';
          }
        }

        const registration = await prisma.dangKyHoatDong.create({
          data: {
            sv_id: student.id,
            hd_id: activity.id,
            ngay_dang_ky: new Date(activity.ngay_bd.getTime() - randomInt(2, 10) * 24 * 60 * 60 * 1000),
            trang_thai_dk: trangThaiDK,
            ly_do_dk: trangThaiDK === 'cho_duyet' ? 'Sinh viên đăng ký tham gia hoạt động' : null,
            ly_do_tu_choi: trangThaiDK === 'tu_choi' ? 'Không đủ điều kiện tham gia' : null,
            ngay_duyet: ['da_duyet', 'da_tham_gia', 'tu_choi'].includes(trangThaiDK) 
              ? new Date(activity.ngay_bd.getTime() - randomInt(1, 5) * 24 * 60 * 60 * 1000)
              : null,
            ghi_chu: trangThaiDK === 'da_duyet' ? '[Lớp trưởng] Đã phê duyệt' : null
          }
        });

        registrationCount++;

        // Tạo điểm danh cho những hoạt động đã tham gia
        if (trangThaiDK === 'da_tham_gia' && new Date() > activity.ngay_kt) {
          await prisma.diemDanh.create({
            data: {
              nguoi_diem_danh_id: activity.nguoi_tao_id,
              sv_id: student.id,
              hd_id: activity.id,
              tg_diem_danh: new Date(activity.ngay_bd.getTime() + randomInt(0, 60) * 60 * 1000),
              phuong_thuc: randomElement(['qr', 'truyen_thong']),
              trang_thai_tham_gia: randomElement(['co_mat', 'muon']),
              xac_nhan_tham_gia: true
            }
          });
          attendanceCount++;
        }
      }

      // Đảm bảo sinh viên có đủ điểm (50-100)
      if (studentPoints < MIN_POINTS) {
        // Thêm một số hoạt động đã tham gia để đủ điểm
        const remainingActivities = approvedActivities.filter(a => 
          !selectedActivities.includes(a) && new Date() > a.ngay_kt
        );
        
        for (const activity of remainingActivities) {
          if (studentPoints >= MIN_POINTS) break;
          
          await prisma.dangKyHoatDong.create({
            data: {
              sv_id: student.id,
              hd_id: activity.id,
              ngay_dang_ky: new Date(activity.ngay_bd.getTime() - randomInt(2, 10) * 24 * 60 * 60 * 1000),
              trang_thai_dk: 'da_tham_gia',
              ngay_duyet: new Date(activity.ngay_bd.getTime() - randomInt(1, 5) * 24 * 60 * 60 * 1000),
              ghi_chu: '[Lớp trưởng] Đã phê duyệt'
            }
          });

          await prisma.diemDanh.create({
            data: {
              nguoi_diem_danh_id: activity.nguoi_tao_id,
              sv_id: student.id,
              hd_id: activity.id,
              tg_diem_danh: new Date(activity.ngay_bd.getTime() + randomInt(0, 60) * 60 * 1000),
              phuong_thuc: 'qr',
              trang_thai_tham_gia: 'co_mat',
              xac_nhan_tham_gia: true
            }
          });

          studentPoints += parseFloat(activity.diem_rl);
          registrationCount++;
          attendanceCount++;
        }
      }
    }

    console.log(`   ✅ Đã tạo ${registrationCount} đăng ký`);
    console.log(`   ✅ Đã tạo ${attendanceCount} điểm danh`);

    // 8. Tạo loại thông báo và thông báo
    console.log('\n📋 Bước 8: Tạo thông báo...');
    
    const notificationTypes = [
      { ten_loai_tb: 'Thông báo chung', mo_ta: 'Thông báo chung từ nhà trường' },
      { ten_loai_tb: 'Hoạt động mới', mo_ta: 'Thông báo về hoạt động mới' },
      { ten_loai_tb: 'Phê duyệt', mo_ta: 'Thông báo về phê duyệt' },
      { ten_loai_tb: 'Nhắc nhở', mo_ta: 'Thông báo nhắc nhở' },
    ];

    for (const type of notificationTypes) {
      const existing = await prisma.loaiThongBao.findFirst({ where: { ten_loai_tb: type.ten_loai_tb } });
      if (!existing) {
        await prisma.loaiThongBao.create({ data: type });
      }
    }

    const loaiTBs = await prisma.loaiThongBao.findMany();
    let notificationCount = 0;

    // Tạo thông báo cho một số sinh viên
    for (let i = 0; i < Math.min(10, students.length); i++) {
      const student = students[i];
      const loaiTB = randomElement(loaiTBs);

      await prisma.thongBao.create({
        data: {
          tieu_de: 'Thông báo về hoạt động rèn luyện',
          noi_dung: 'Bạn có hoạt động mới cần tham gia. Vui lòng kiểm tra và đăng ký.',
          loai_tb_id: loaiTB.id,
          nguoi_gui_id: teacher.id,
          nguoi_nhan_id: student.nguoi_dung_id,
          da_doc: Math.random() < 0.5,
          muc_do_uu_tien: randomElement(['thap', 'trung_binh', 'cao']),
          ngay_doc: Math.random() < 0.5 ? new Date() : null,
          phuong_thuc_gui: 'trong_he_thong'
        }
      });

      notificationCount++;
    }

    console.log(`   ✅ Đã tạo ${notificationCount} thông báo`);

    // 9. Thống kê cuối cùng
    console.log('\n' + '='.repeat(60));
    console.log('📊 THỐNG KÊ DỮ LIỆU:');
    console.log('='.repeat(60));
    
    const stats = {
      classes: await prisma.lop.count(),
      students: await prisma.sinhVien.count(),
      activities: await prisma.hoatDong.count(),
      registrations: await prisma.dangKyHoatDong.count(),
      attendances: await prisma.diemDanh.count(),
      notifications: await prisma.thongBao.count(),
    };

    console.log(`Lớp học:              ${stats.classes}`);
    console.log(`Sinh viên:            ${stats.students}`);
    console.log(`Hoạt động:            ${stats.activities}`);
    console.log(`Đăng ký:              ${stats.registrations}`);
    console.log(`Điểm danh:            ${stats.attendances}`);
    console.log(`Thông báo:            ${stats.notifications}`);

    // Kiểm tra điểm rèn luyện của một số sinh viên
    console.log('\n📈 KIỂM TRA ĐIỂM RÈN LUYỆN MỘT SỐ SINH VIÊN:');
    for (let i = 0; i < Math.min(5, students.length); i++) {
      const student = students[i];
      const registrations = await prisma.dangKyHoatDong.findMany({
        where: {
          sv_id: student.id,
          trang_thai_dk: 'da_tham_gia'
        },
        include: {
          hoat_dong: true
        }
      });

      const totalPoints = registrations.reduce((sum, reg) => sum + parseFloat(reg.hoat_dong.diem_rl), 0);
      const pendingCount = await prisma.dangKyHoatDong.count({
        where: {
          sv_id: student.id,
          trang_thai_dk: 'cho_duyet'
        }
      });

      console.log(`${student.mssv}: ${totalPoints.toFixed(2)} điểm | ${registrations.length} hoạt động hoàn thành | ${pendingCount} chờ duyệt`);
    }

    console.log('\n' + '='.repeat(60));
    console.log('✅ HOÀN TẤT SEED DỮ LIỆU!');
    console.log('='.repeat(60));
    console.log('\n💡 TÀI KHOẢN DEMO:');
    console.log(`Lớp trưởng: ${monitorStudent.mssv} / 123456`);
    console.log(`Sinh viên:  ${students[1].mssv} / 123456`);
    console.log(`Giảng viên: ${teacher.ten_dn} / 123456`);

  } catch (error) {
    console.error('\n❌ LỖI:', error.message);
    console.error(error);
  } finally {
    await prisma.$disconnect();
  }
}

// Chạy script
main()
  .then(() => {
    console.log('\n✅ Script hoàn tất\n');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Script thất bại:', error);
    process.exit(1);
  });
