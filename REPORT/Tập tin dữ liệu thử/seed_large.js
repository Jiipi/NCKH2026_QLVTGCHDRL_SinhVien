/**
 * SEED LARGE DATA - 2000 sinh viên, 100 giảng viên
 * 
 * Cấu trúc:
 * - 4 Vai trò: ADMIN, GIANG_VIEN, LOP_TRUONG, SINH_VIEN
 * - 1 Admin
 * - 100 Giảng viên (10 khoa x 10 GV/khoa)
 * - 40 Lớp (4 khoa x 10 lớp/khoa)
 * - 2000 Sinh viên (50 SV/lớp)
 * - 40 Lớp trưởng (1/lớp)
 * - 200+ Hoạt động
 * - Đăng ký và điểm danh
 * - Thông báo
 * 
 * Chạy: docker exec dacn_backend_dev node prisma/seed_large.js
 */

const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

// ===================== CONFIG =====================
const CONFIG = {
  NUM_FACULTIES: 4,
  TEACHERS_PER_FACULTY: 25, // 100 GV tổng
  CLASSES_PER_FACULTY: 10,   // 40 lớp tổng
  STUDENTS_PER_CLASS: 50,    // 2000 SV tổng
  ACTIVITIES_PER_SEMESTER: 50,
  // Sử dụng năm đơn để khớp với logic frontend/backend
  NAM_HOC: '2024',
};

// ===================== DATA POOLS =====================
const HO = ['Nguyễn', 'Trần', 'Lê', 'Phạm', 'Hoàng', 'Huỳnh', 'Võ', 'Phan', 'Vũ', 'Đặng', 'Bùi', 'Đỗ', 'Hồ', 'Ngô', 'Dương', 'Lý', 'Đinh', 'Tạ', 'Cao', 'Hà'];
const TEN_DEM = ['Văn', 'Thị', 'Hữu', 'Đức', 'Minh', 'Anh', 'Thanh', 'Quốc', 'Hồng', 'Ngọc', 'Thu', 'Mai', 'Phương', 'Kim', 'Bảo'];
const TEN = ['An', 'Bình', 'Cường', 'Dũng', 'Hùng', 'Khoa', 'Long', 'Nam', 'Phong', 'Quân', 'Tú', 'Vinh', 'Hà', 'Linh', 'My', 'Ngân', 'Thảo', 'Trang', 'Vy', 'Yến', 'Đạt', 'Hiếu', 'Huy', 'Khang', 'Lâm', 'Minh', 'Nhật', 'Phúc', 'Sơn', 'Tâm', 'Thiện', 'Trung', 'Tuấn', 'Việt', 'Vương'];

const KHOA_LIST = [
  { ten: 'Công nghệ thông tin', ma: 'CNTT' },
  { ten: 'Kỹ thuật phần mềm', ma: 'KTPM' },
  { ten: 'An toàn thông tin', ma: 'ATTT' },
  { ten: 'Khoa học máy tính', ma: 'KHMT' },
];

const LOAI_HOAT_DONG = [
  { ten: 'Tình nguyện', mo_ta: 'Hoạt động tình nguyện cộng đồng', diem: 3, max: 8, mau: '#22c55e' },
  { ten: 'Thể thao', mo_ta: 'Giải đấu thể thao, rèn luyện sức khỏe', diem: 2, max: 6, mau: '#3b82f6' },
  { ten: 'Văn nghệ', mo_ta: 'Hoạt động văn hóa nghệ thuật', diem: 2, max: 5, mau: '#f59e0b' },
  { ten: 'Học thuật', mo_ta: 'Hội thảo, seminar, nghiên cứu', diem: 4, max: 10, mau: '#8b5cf6' },
  { ten: 'Đoàn - Hội', mo_ta: 'Hoạt động Đoàn thanh niên, Hội SV', diem: 3, max: 7, mau: '#ef4444' },
  { ten: 'Kỹ năng mềm', mo_ta: 'Rèn luyện kỹ năng mềm', diem: 2, max: 5, mau: '#14b8a6' },
];

const TEN_HOAT_DONG = [
  'Chiến dịch Mùa hè xanh',
  'Giải bóng đá sinh viên',
  'Đêm nhạc Acoustic',
  'Hội thảo AI trong giáo dục',
  'Ngày hội việc làm',
  'Cuộc thi Olympic Tin học',
  'Workshop UI/UX Design',
  'Hiến máu nhân đạo',
  'Dọn dẹp bãi biển',
  'Hội chợ khởi nghiệp',
  'Talkshow kỹ năng mềm',
  'Cuộc thi lập trình ACM',
  'Workshop Cloud Computing',
  'Giải cầu lông sinh viên',
  'Đêm hội Halloween',
  'Seminar Blockchain',
  'Cuộc thi Hackathon',
  'Hoạt động từ thiện',
  'Giải bóng chuyền',
  'Workshop Machine Learning',
  'Hội thảo Cybersecurity',
  'Ngày hội Sách',
  'Talkshow khởi nghiệp',
  'Cuộc thi English Speaking',
  'Workshop Git & GitHub',
];

const DIA_DIEM = [
  'Hội trường A', 'Hội trường B', 'Sân vận động', 'Phòng hội thảo C301',
  'Thư viện', 'Sảnh chính', 'Phòng Lab CNTT', 'Khu vực ngoài trời',
  'Trung tâm hội nghị', 'Phòng seminar 201', 'Nhà văn hóa sinh viên'
];

const DON_VI_TO_CHUC = [
  'Đoàn Thanh niên', 'Hội Sinh viên', 'CLB Tin học', 'CLB Thể thao',
  'CLB Âm nhạc', 'Khoa CNTT', 'Khoa KTPM', 'Phòng Công tác SV',
  'CLB Tiếng Anh', 'CLB Khởi nghiệp', 'Ban Chấp hành Đoàn'
];

// ===================== HELPERS =====================
function randomElement(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function generateVietnameseName() {
  return `${randomElement(HO)} ${randomElement(TEN_DEM)} ${randomElement(TEN)}`;
}

function generateMSSV(khoa, lopIndex, svIndex) {
  // Format: 21 + khoa (1-4) + lớp (01-10) + sv (01-50) = 10 chars max
  const khoaCode = String(KHOA_LIST.findIndex(k => k.ma === khoa) + 1);
  const lopCode = String(lopIndex + 1).padStart(2, '0');
  const svCode = String(svIndex + 1).padStart(2, '0');
  return `21${khoaCode}${lopCode}${svCode}`; // e.g., 2110101 (7 chars)
}

function generateTeacherCode(khoaIndex, gvIndex) {
  return `gv${String(khoaIndex + 1).padStart(2, '0')}${String(gvIndex + 1).padStart(2, '0')}`;
}

function generateEmail(username, domain = 'dlu.edu.vn') {
  return `${username}@${domain}`;
}

function generatePhoneNumber() {
  const prefixes = ['090', '091', '093', '094', '097', '098', '086', '088', '089'];
  return `${randomElement(prefixes)}${String(randomInt(1000000, 9999999))}`; // 10 chars
}

function generateAddress() {
  const streets = ['Lê Lợi', 'Nguyễn Huệ', 'Trần Hưng Đạo', 'Hai Bà Trưng', 'Lý Thường Kiệt', 'Võ Văn Tần', 'Pasteur', 'Điện Biên Phủ', 'Cách Mạng Tháng 8', 'Nguyễn Thị Minh Khai'];
  const districts = ['Quận 1', 'Quận 3', 'Quận 5', 'Quận 7', 'Quận 10', 'Thủ Đức', 'Bình Thạnh', 'Gò Vấp', 'Phú Nhuận', 'Tân Bình'];
  return `${randomInt(1, 500)} ${randomElement(streets)}, ${randomElement(districts)}, TP.HCM`;
}

function randomDate(start, end) {
  return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
}

function addDays(date, days) {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}

// ===================== MAIN SEED =====================
async function main() {
  console.log('🚀 BẮT ĐẦU SEED DỮ LIỆU LỚN');
  console.log('='.repeat(60));
  console.log(`📊 Mục tiêu:`);
  console.log(`   - ${CONFIG.NUM_FACULTIES} khoa`);
  console.log(`   - ${CONFIG.NUM_FACULTIES * CONFIG.TEACHERS_PER_FACULTY} giảng viên`);
  console.log(`   - ${CONFIG.NUM_FACULTIES * CONFIG.CLASSES_PER_FACULTY} lớp`);
  console.log(`   - ${CONFIG.NUM_FACULTIES * CONFIG.CLASSES_PER_FACULTY * CONFIG.STUDENTS_PER_CLASS} sinh viên`);
  console.log('='.repeat(60));

  const startTime = Date.now();

  try {
    // ========== STEP 1: VAI TRÒ ==========
    console.log('\n📋 Bước 1/10: Tạo vai trò...');
    
    const roles = await Promise.all([
      prisma.vaiTro.upsert({
        where: { ten_vt: 'ADMIN' },
        update: { quyen_han: { permissions: ['*'] } },
        create: {
          ten_vt: 'ADMIN',
          mo_ta: 'Quản trị viên hệ thống',
          quyen_han: { permissions: ['*'] }
        }
      }),
      prisma.vaiTro.upsert({
        where: { ten_vt: 'GIANG_VIEN' },
        update: {},
        create: {
          ten_vt: 'GIANG_VIEN',
          mo_ta: 'Giảng viên chủ nhiệm',
          quyen_han: { permissions: ['activities.create', 'activities.approve', 'registrations.approve', 'reports.view'] }
        }
      }),
      prisma.vaiTro.upsert({
        where: { ten_vt: 'LOP_TRUONG' },
        update: {},
        create: {
          ten_vt: 'LOP_TRUONG',
          mo_ta: 'Lớp trưởng',
          quyen_han: { permissions: ['activities.create', 'registrations.view', 'attendance.manage'] }
        }
      }),
      prisma.vaiTro.upsert({
        where: { ten_vt: 'SINH_VIEN' },
        update: {},
        create: {
          ten_vt: 'SINH_VIEN',
          mo_ta: 'Sinh viên',
          quyen_han: { permissions: ['activities.view', 'registrations.register'] }
        }
      })
    ]);

    const [roleAdmin, roleTeacher, roleMonitor, roleStudent] = roles;
    console.log('   ✅ Đã tạo 4 vai trò');

    // ========== STEP 2: ADMIN ==========
    console.log('\n👤 Bước 2/10: Tạo Admin...');
    
    const hashedPassword = await bcrypt.hash('123456', 10);
    const adminUser = await prisma.nguoiDung.upsert({
      where: { ten_dn: 'admin' },
      update: {},
      create: {
        ten_dn: 'admin',
        mat_khau: hashedPassword,
        email: 'admin@dlu.edu.vn',
        ho_ten: 'Quản Trị Viên',
        vai_tro_id: roleAdmin.id,
        trang_thai: 'hoat_dong'
      }
    });
    console.log('   ✅ Admin: admin / 123456');

    // ========== STEP 3: LOẠI HOẠT ĐỘNG ==========
    console.log('\n📚 Bước 3/10: Tạo loại hoạt động...');
    
    const activityTypes = [];
    for (const type of LOAI_HOAT_DONG) {
      const created = await prisma.loaiHoatDong.upsert({
        where: { ten_loai_hd: type.ten },
        update: {},
        create: {
          ten_loai_hd: type.ten,
          mo_ta: type.mo_ta,
          diem_mac_dinh: type.diem,
          diem_toi_da: type.max,
          mau_sac: type.mau,
          nguoi_tao_id: adminUser.id
        }
      });
      activityTypes.push(created);
    }
    console.log(`   ✅ Đã tạo ${activityTypes.length} loại hoạt động`);

    // ========== STEP 4: LOẠI THÔNG BÁO ==========
    console.log('\n🔔 Bước 4/10: Tạo loại thông báo...');
    
    const notifTypes = await Promise.all([
      prisma.loaiThongBao.upsert({
        where: { ten_loai_tb: 'Thông báo chung' },
        update: {},
        create: { ten_loai_tb: 'Thông báo chung', mo_ta: 'Thông báo chung từ nhà trường' }
      }),
      prisma.loaiThongBao.upsert({
        where: { ten_loai_tb: 'Hoạt động' },
        update: {},
        create: { ten_loai_tb: 'Hoạt động', mo_ta: 'Thông báo về hoạt động' }
      }),
      prisma.loaiThongBao.upsert({
        where: { ten_loai_tb: 'Điểm rèn luyện' },
        update: {},
        create: { ten_loai_tb: 'Điểm rèn luyện', mo_ta: 'Thông báo về điểm' }
      }),
    ]);
    console.log(`   ✅ Đã tạo ${notifTypes.length} loại thông báo`);

    // ========== STEP 5: GIẢNG VIÊN ==========
    console.log('\n👨‍🏫 Bước 5/10: Tạo giảng viên...');
    
    const allTeachers = [];
    
    for (let k = 0; k < KHOA_LIST.length; k++) {
      const khoa = KHOA_LIST[k];
      for (let g = 0; g < CONFIG.TEACHERS_PER_FACULTY; g++) {
        const teacherCode = generateTeacherCode(k, g);
        const hoTen = generateVietnameseName();
        
        const teacher = await prisma.nguoiDung.upsert({
          where: { ten_dn: teacherCode },
          update: {},
          create: {
            ten_dn: teacherCode,
            mat_khau: hashedPassword,
            email: generateEmail(teacherCode),
            ho_ten: hoTen,
            vai_tro_id: roleTeacher.id,
            trang_thai: 'hoat_dong'
          }
        });
        
        allTeachers.push({ ...teacher, khoaIndex: k, khoa: khoa });
      }
      console.log(`   ✅ Khoa ${khoa.ten}: ${CONFIG.TEACHERS_PER_FACULTY} GV`);
    }
    console.log(`   📊 Tổng: ${allTeachers.length} giảng viên`);

    // ========== STEP 6: LỚP HỌC ==========
    console.log('\n🏫 Bước 6/10: Tạo lớp học...');
    
    const allClasses = [];
    const nienKhoaList = ['K46', 'K47', 'K48', 'K49', 'K50'];
    
    for (let k = 0; k < KHOA_LIST.length; k++) {
      const khoa = KHOA_LIST[k];
      const facultyTeachers = allTeachers.filter(t => t.khoaIndex === k);
      
      for (let l = 0; l < CONFIG.CLASSES_PER_FACULTY; l++) {
        const nienKhoa = nienKhoaList[l % nienKhoaList.length];
        const tenLop = `${khoa.ma}${nienKhoa}${String.fromCharCode(65 + (l % 4))}`; // A, B, C, D
        const teacher = facultyTeachers[l % facultyTeachers.length];
        
        const lop = await prisma.lop.upsert({
          where: { ten_lop: tenLop },
          update: {},
          create: {
            ten_lop: tenLop,
            khoa: khoa.ten,
            nien_khoa: nienKhoa,
            nam_nhap_hoc: new Date(`${2021 + (l % 4)}-09-01`),
            nam_tot_nghiep: new Date(`${2025 + (l % 4)}-06-30`),
            chu_nhiem: teacher.id
          }
        });
        
        allClasses.push({ ...lop, khoaMa: khoa.ma, khoaIndex: k, lopIndex: l, teacherId: teacher.id });
      }
      console.log(`   ✅ Khoa ${khoa.ten}: ${CONFIG.CLASSES_PER_FACULTY} lớp`);
    }
    console.log(`   📊 Tổng: ${allClasses.length} lớp học`);

    // ========== STEP 7: SINH VIÊN ==========
    console.log('\n🎓 Bước 7/10: Tạo sinh viên (có thể mất vài phút)...');
    
    const allStudents = [];
    let totalCreated = 0;
    
    for (const lop of allClasses) {
      const classStudents = [];
      
      for (let s = 0; s < CONFIG.STUDENTS_PER_CLASS; s++) {
        const mssv = generateMSSV(lop.khoaMa, lop.lopIndex, s);
        const hoTen = generateVietnameseName();
        const isMonitor = s === 0; // Sinh viên đầu tiên là lớp trưởng
        
        // Tạo user
        const user = await prisma.nguoiDung.upsert({
          where: { ten_dn: mssv },
          update: {},
          create: {
            ten_dn: mssv,
            mat_khau: hashedPassword,
            email: generateEmail(mssv, 'student.dlu.edu.vn'),
            ho_ten: hoTen,
            vai_tro_id: isMonitor ? roleMonitor.id : roleStudent.id,
            trang_thai: 'hoat_dong'
          }
        });
        
        // Tạo sinh viên
        const sv = await prisma.sinhVien.upsert({
          where: { nguoi_dung_id: user.id },
          update: {},
          create: {
            nguoi_dung_id: user.id,
            mssv: mssv,
            ngay_sinh: randomDate(new Date('2000-01-01'), new Date('2004-12-31')),
            gt: randomElement(['nam', 'nu']),
            lop_id: lop.id,
            dia_chi: generateAddress(),
            sdt: generatePhoneNumber(),
            email: generateEmail(mssv, 'student.dlu.edu.vn')
          }
        });
        
        classStudents.push({ ...sv, isMonitor, userId: user.id, lopId: lop.id });
        totalCreated++;
      }
      
      // Update lớp trưởng
      const monitor = classStudents.find(s => s.isMonitor);
      if (monitor) {
        await prisma.lop.update({
          where: { id: lop.id },
          data: { lop_truong: monitor.id }
        });
      }
      
      allStudents.push(...classStudents);
      
      if (allClasses.indexOf(lop) % 5 === 4) {
        console.log(`   ✅ Đã tạo ${totalCreated}/${CONFIG.NUM_FACULTIES * CONFIG.CLASSES_PER_FACULTY * CONFIG.STUDENTS_PER_CLASS} sinh viên`);
      }
    }
    console.log(`   📊 Tổng: ${allStudents.length} sinh viên (${allStudents.filter(s => s.isMonitor).length} lớp trưởng)`);

    // ========== STEP 8: HOẠT ĐỘNG ==========
    console.log('\n🎯 Bước 8/10: Tạo hoạt động...');
    
    const now = new Date();
    const allActivities = [];
    let activityCounter = 1;
    
    // Hoạt động cấp trường (do Admin tạo)
    for (let i = 0; i < 20; i++) {
      const type = randomElement(activityTypes);
      const tenHD = `${TEN_HOAT_DONG[i % TEN_HOAT_DONG.length]} ${CONFIG.NAM_HOC}`;
      const maHD = `HD${String(activityCounter++).padStart(4, '0')}`;
      
      const ngayBD = addDays(now, randomInt(-30, 60));
      const ngayKT = addDays(ngayBD, randomInt(1, 7));
      const hanDK = addDays(ngayBD, -randomInt(1, 7));
      
      const trangThai = ngayKT < now ? 'ket_thuc' : (ngayBD < now ? 'da_duyet' : randomElement(['cho_duyet', 'da_duyet']));
      
      const activity = await prisma.hoatDong.upsert({
        where: { ma_hd: maHD },
        update: {},
        create: {
          ma_hd: maHD,
          ten_hd: tenHD,
          mo_ta: `Mô tả chi tiết về hoạt động ${tenHD}`,
          loai_hd_id: type.id,
          diem_rl: randomInt(type.diem_mac_dinh, type.diem_toi_da),
          dia_diem: randomElement(DIA_DIEM),
          ngay_bd: ngayBD,
          ngay_kt: ngayKT,
          han_dk: hanDK,
          sl_toi_da: randomInt(50, 500),
          don_vi_to_chuc: randomElement(DON_VI_TO_CHUC),
          yeu_cau_tham_gia: 'Sinh viên toàn trường',
          trang_thai: trangThai,
          co_chung_chi: Math.random() > 0.7,
          hoc_ky: Math.random() > 0.5 ? 'hoc_ky_1' : 'hoc_ky_2',
          nam_hoc: CONFIG.NAM_HOC,
          nguoi_tao_id: adminUser.id,
          hinh_anh: [],
          tep_dinh_kem: []
        }
      });
      allActivities.push({ ...activity, isSchoolWide: true });
    }
    console.log(`   ✅ Đã tạo 20 hoạt động cấp trường`);

    // Hoạt động cấp lớp (do lớp trưởng hoặc GV tạo)
    for (const lop of allClasses) {
      const monitor = allStudents.find(s => s.lopId === lop.id && s.isMonitor);
      const teacherId = lop.teacherId;
      
      for (let i = 0; i < 5; i++) {
        const type = randomElement(activityTypes);
        const tenHD = `${TEN_HOAT_DONG[randomInt(0, TEN_HOAT_DONG.length - 1)]} - ${lop.ten_lop}`;
        const maHD = `HD${String(activityCounter++).padStart(4, '0')}`;
        
        const ngayBD = addDays(now, randomInt(-30, 60));
        const ngayKT = addDays(ngayBD, randomInt(1, 3));
        const hanDK = addDays(ngayBD, -randomInt(1, 5));
        
        const trangThai = ngayKT < now ? 'ket_thuc' : (ngayBD < now ? 'da_duyet' : randomElement(['cho_duyet', 'da_duyet']));
        
        const activity = await prisma.hoatDong.upsert({
          where: { ma_hd: maHD },
          update: {},
          create: {
            ma_hd: maHD,
            ten_hd: tenHD,
            mo_ta: `Hoạt động dành cho sinh viên lớp ${lop.ten_lop}`,
            loai_hd_id: type.id,
            lop_id: lop.id,
            diem_rl: randomInt(type.diem_mac_dinh, type.diem_toi_da),
            dia_diem: randomElement(DIA_DIEM),
            ngay_bd: ngayBD,
            ngay_kt: ngayKT,
            han_dk: hanDK,
            sl_toi_da: randomInt(30, 60),
            don_vi_to_chuc: `Lớp ${lop.ten_lop}`,
            yeu_cau_tham_gia: `Sinh viên lớp ${lop.ten_lop}`,
            trang_thai: trangThai,
            co_chung_chi: Math.random() > 0.8,
            hoc_ky: Math.random() > 0.5 ? 'hoc_ky_1' : 'hoc_ky_2',
            nam_hoc: CONFIG.NAM_HOC,
            nguoi_tao_id: Math.random() > 0.5 ? (monitor?.userId || teacherId) : teacherId,
            hinh_anh: [],
            tep_dinh_kem: []
          }
        });
        allActivities.push({ ...activity, isSchoolWide: false, lopId: lop.id });
      }
    }
    console.log(`   ✅ Đã tạo ${allClasses.length * 5} hoạt động cấp lớp`);
    console.log(`   📊 Tổng: ${allActivities.length} hoạt động`);

    // ========== STEP 9: ĐĂNG KÝ & ĐIỂM DANH ==========
    console.log('\n📝 Bước 9/10: Tạo đăng ký và điểm danh (có thể mất vài phút)...');
    
    let totalRegistrations = 0;
    let totalAttendance = 0;
    
    // Lấy hoạt động đã duyệt hoặc kết thúc
    const approvedActivities = allActivities.filter(a => ['da_duyet', 'ket_thuc'].includes(a.trang_thai));
    
    // Mỗi sinh viên đăng ký ngẫu nhiên 5-15 hoạt động
    for (const student of allStudents) {
      // Lấy hoạt động phù hợp (cấp trường hoặc cùng lớp)
      const eligibleActivities = approvedActivities.filter(a => 
        a.isSchoolWide || a.lopId === student.lopId
      );
      
      const numToRegister = randomInt(5, Math.min(15, eligibleActivities.length));
      const selectedActivities = eligibleActivities
        .sort(() => Math.random() - 0.5)
        .slice(0, numToRegister);
      
      for (const activity of selectedActivities) {
        const trangThaiDK = activity.trang_thai === 'ket_thuc' 
          ? 'da_tham_gia' 
          : randomElement(['cho_duyet', 'da_duyet', 'da_duyet', 'da_duyet']); // Bias toward approved
        
        try {
          await prisma.dangKyHoatDong.upsert({
            where: { sv_id_hd_id: { sv_id: student.id, hd_id: activity.id } },
            update: {},
            create: {
              sv_id: student.id,
              hd_id: activity.id,
              ngay_dang_ky: randomDate(addDays(activity.han_dk, -7), activity.han_dk),
              trang_thai_dk: trangThaiDK,
              ly_do_dk: 'Muốn tham gia để tích lũy điểm rèn luyện',
              nguoi_duyet_id: trangThaiDK !== 'cho_duyet' ? adminUser.id : null,
              ngay_duyet: trangThaiDK !== 'cho_duyet' ? new Date() : null
            }
          });
          totalRegistrations++;
          
          // Tạo điểm danh cho hoạt động đã kết thúc và đăng ký được duyệt
          if (activity.trang_thai === 'ket_thuc' && trangThaiDK === 'da_tham_gia') {
            await prisma.diemDanh.upsert({
              where: { sv_id_hd_id: { sv_id: student.id, hd_id: activity.id } },
              update: {},
              create: {
                nguoi_diem_danh_id: adminUser.id,
                sv_id: student.id,
                hd_id: activity.id,
                tg_diem_danh: randomDate(activity.ngay_bd, activity.ngay_kt),
                phuong_thuc: randomElement(['qr', 'truyen_thong']),
                trang_thai_tham_gia: Math.random() > 0.1 ? 'co_mat' : randomElement(['vang_mat', 'muon']),
                xac_nhan_tham_gia: true
              }
            });
            totalAttendance++;
          }
        } catch (e) {
          // Skip duplicate
        }
      }
      
      if (allStudents.indexOf(student) % 200 === 199) {
        console.log(`   ✅ Xử lý ${allStudents.indexOf(student) + 1}/${allStudents.length} sinh viên`);
      }
    }
    console.log(`   📊 Tổng: ${totalRegistrations} đăng ký, ${totalAttendance} điểm danh`);

    // ========== STEP 10: THÔNG BÁO ==========
    console.log('\n💌 Bước 10/10: Tạo thông báo...');
    
    const notifTypeHD = notifTypes.find(n => n.ten_loai_tb === 'Hoạt động');
    let totalNotifications = 0;
    
    // Gửi thông báo cho 500 sinh viên ngẫu nhiên
    const randomStudents = allStudents.sort(() => Math.random() - 0.5).slice(0, 500);
    
    for (const student of randomStudents) {
      await prisma.thongBao.create({
        data: {
          tieu_de: 'Hoạt động mới đang chờ bạn tham gia!',
          noi_dung: `Hệ thống có nhiều hoạt động mới dành cho bạn. Hãy đăng ký ngay để tích lũy điểm rèn luyện!`,
          loai_tb_id: notifTypeHD.id,
          nguoi_gui_id: adminUser.id,
          nguoi_nhan_id: student.userId,
          da_doc: Math.random() > 0.5,
          muc_do_uu_tien: randomElement(['thap', 'trung_binh', 'cao']),
          phuong_thuc_gui: 'trong_he_thong'
        }
      });
      totalNotifications++;
    }
    console.log(`   📊 Tổng: ${totalNotifications} thông báo`);

    // ========== SUMMARY ==========
    const endTime = Date.now();
    const duration = ((endTime - startTime) / 1000).toFixed(1);
    
    console.log('\n' + '='.repeat(60));
    console.log('✨ SEED HOÀN TẤT!');
    console.log('='.repeat(60));
    console.log(`⏱️  Thời gian: ${duration} giây`);
    console.log(`\n📊 Thống kê:`);
    console.log(`   - Vai trò: 4`);
    console.log(`   - Admin: 1`);
    console.log(`   - Giảng viên: ${allTeachers.length}`);
    console.log(`   - Lớp học: ${allClasses.length}`);
    console.log(`   - Sinh viên: ${allStudents.length}`);
    console.log(`   - Lớp trưởng: ${allStudents.filter(s => s.isMonitor).length}`);
    console.log(`   - Loại hoạt động: ${activityTypes.length}`);
    console.log(`   - Hoạt động: ${allActivities.length}`);
    console.log(`   - Đăng ký: ${totalRegistrations}`);
    console.log(`   - Điểm danh: ${totalAttendance}`);
    console.log(`   - Thông báo: ${totalNotifications}`);
    
    console.log(`\n🔑 Đăng nhập:`);
    console.log(`   Admin: admin / 123456`);
    console.log(`   Giảng viên: gv0101 - gv0425 / 123456`);
    console.log(`   Lớp trưởng: 2110101, 2120101, ... / 123456`);
    console.log(`   Sinh viên: 2110102, 2110103, ... / 123456`);
    
  } catch (error) {
    console.error('\n❌ LỖI:', error);
    throw error;
  }
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
