const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

/**
 * Script để thêm dữ liệu mẫu hoạt động cho từng lớp
 * - Mỗi lớp có khoảng 100 hoạt động
 * - Mỗi sinh viên đăng ký ít nhất 10 hoạt động trong lớp của họ
 */

// Danh sách các loại hoạt động có thể có
const ACTIVITY_TEMPLATES = [
  { 
    prefix: 'HĐNN', 
    name: 'Hoạt động ngoại khóa',
    templates: [
      'Tham quan doanh nghiệp',
      'Workshop kỹ năng mềm',
      'Seminar chuyên ngành',
      'Hội thảo khoa học',
      'Chương trình giao lưu'
    ]
  },
  {
    prefix: 'HĐTT',
    name: 'Hoạt động tình nguyện',
    templates: [
      'Hiến máu nhân đạo',
      'Dọn vệ sinh môi trường',
      'Tình nguyện mùa thi',
      'Hỗ trợ người nghèo',
      'Chăm sóc người già'
    ]
  },
  {
    prefix: 'HĐVH',
    name: 'Hoạt động văn hóa',
    templates: [
      'Ngày hội văn hóa',
      'Liên hoan văn nghệ',
      'Cuộc thi tài năng',
      'Triển lãm nghệ thuật',
      'Biểu diễn văn nghệ'
    ]
  },
  {
    prefix: 'HĐTT',
    name: 'Hoạt động thể thao',
    templates: [
      'Giải bóng đá',
      'Giải cầu lông',
      'Giải bóng chuyền',
      'Giải chạy việt dã',
      'Ngày hội thể thao'
    ]
  },
  {
    prefix: 'HĐHK',
    name: 'Hoạt động học thuật',
    templates: [
      'Cuộc thi lập trình',
      'Hackathon',
      'Nghiên cứu khoa học',
      'Báo cáo chuyên đề',
      'Đồ án môn học'
    ]
  }
];

const LOCATIONS = [
  'Hội trường A',
  'Hội trường B',
  'Sân vận động',
  'Phòng họp 201',
  'Phòng họp 301',
  'Khu thực hành',
  'Sân trường',
  'Online - Microsoft Teams',
  'Online - Zoom',
  'Ngoài trường'
];

const ORGANIZATIONS = [
  'Khoa Công nghệ Thông tin',
  'Đoàn Thanh niên',
  'Hội Sinh viên',
  'Phòng Công tác Sinh viên',
  'Trung tâm Hỗ trợ Sinh viên',
  'Câu lạc bộ Khoa học'
];

// Hàm tạo mã hoạt động duy nhất
function generateActivityCode(prefix, index, classCode) {
  return `${prefix}_${classCode}_${String(index).padStart(3, '0')}`;
}

// Hàm random từ array
function randomItem(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

// Hàm random số nguyên trong khoảng
function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

// Hàm tạo ngày random trong khoảng
function randomDate(start, end) {
  return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
}

// Hàm kiểm tra dữ liệu hiện tại
async function checkCurrentData() {
  console.log('=== KIỂM TRA DỮ LIỆU HIỆN TẠI ===\n');
  
  // Đếm số lượng lớp
  const classCount = await prisma.lop.count();
  console.log(`📚 Số lượng lớp: ${classCount}`);
  
  // Đếm số lượng sinh viên
  const studentCount = await prisma.sinhVien.count();
  console.log(`👨‍🎓 Số lượng sinh viên: ${studentCount}`);
  
  // Đếm số lượng loại hoạt động
  const activityTypeCount = await prisma.loaiHoatDong.count();
  console.log(`📋 Số loại hoạt động: ${activityTypeCount}`);
  
  // Đếm số lượng hoạt động hiện có
  const activityCount = await prisma.hoatDong.count();
  console.log(`🎯 Số hoạt động hiện có: ${activityCount}`);
  
  // Đếm số đăng ký hoạt động
  const registrationCount = await prisma.dangKyHoatDong.count();
  console.log(`✅ Số đăng ký hoạt động: ${registrationCount}`);
  
  // Lấy thông tin chi tiết các lớp
  const classes = await prisma.lop.findMany({
    include: {
      _count: {
        select: { sinh_viens: true }
      }
    },
    orderBy: {
      ten_lop: 'asc'
    }
  });
  
  console.log('\n=== CHI TIẾT CÁC LỚP ===');
  for (const cls of classes) {
    console.log(`\n📌 Lớp: ${cls.ten_lop}`);
    console.log(`   - Khoa: ${cls.khoa}`);
    console.log(`   - Niên khóa: ${cls.nien_khoa}`);
    console.log(`   - Số sinh viên: ${cls._count.sinh_viens}`);
  }
  
  // Lấy thông tin sinh viên mẫu
  const sampleStudents = await prisma.sinhVien.findMany({
    take: 5,
    include: {
      nguoi_dung: {
        select: {
          ten_dn: true,
          ho_ten: true,
          email: true
        }
      },
      lop: {
        select: {
          ten_lop: true
        }
      },
      _count: {
        select: {
          dang_ky_hd: true
        }
      }
    }
  });
  
  console.log('\n=== MẪU SINH VIÊN ===');
  for (const student of sampleStudents) {
    console.log(`\n👤 ${student.nguoi_dung.ho_ten || student.nguoi_dung.ten_dn}`);
    console.log(`   - MSSV: ${student.mssv}`);
    console.log(`   - Email: ${student.nguoi_dung.email}`);
    console.log(`   - Lớp: ${student.lop.ten_lop}`);
    console.log(`   - Số hoạt động đã đăng ký: ${student._count.dang_ky_hd}`);
  }
  
  return { classes, studentCount };
}

// Hàm tạo hoạt động cho một lớp
async function createActivitiesForClass(classData, activityTypes, creator) {
  const activities = [];
  const numActivities = randomInt(90, 110); // 90-110 hoạt động cho mỗi lớp
  
  console.log(`\n📝 Đang tạo ${numActivities} hoạt động cho lớp ${classData.ten_lop}...`);
  
  const now = new Date();
  const threeMonthsAgo = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
  const threeMonthsLater = new Date(now.getTime() + 90 * 24 * 60 * 60 * 1000);
  
  for (let i = 0; i < numActivities; i++) {
    const template = randomItem(ACTIVITY_TEMPLATES);
    const activityType = randomItem(activityTypes);
    const specificActivity = randomItem(template.templates);
    
    const startDate = randomDate(threeMonthsAgo, threeMonthsLater);
    const endDate = new Date(startDate.getTime() + randomInt(2, 8) * 60 * 60 * 1000); // 2-8 giờ
    const registrationDeadline = new Date(startDate.getTime() - randomInt(1, 5) * 24 * 60 * 60 * 1000); // 1-5 ngày trước
    
    const activityCode = generateActivityCode(template.prefix, i + 1, classData.ten_lop);
    
    // Kiểm tra xem mã hoạt động đã tồn tại chưa
    const existingActivity = await prisma.hoatDong.findUnique({
      where: { ma_hd: activityCode }
    });
    
    if (existingActivity) {
      console.log(`   ⚠️  Hoạt động ${activityCode} đã tồn tại, bỏ qua...`);
      continue;
    }
    
    try {
      const activity = await prisma.hoatDong.create({
        data: {
          ma_hd: activityCode,
          ten_hd: `${specificActivity} - ${classData.ten_lop}`,
          mo_ta: `${specificActivity} dành riêng cho sinh viên lớp ${classData.ten_lop}. Khoa ${classData.khoa}, niên khóa ${classData.nien_khoa}.`,
          loai_hd_id: activityType.id,
          diem_rl: activityType.diem_mac_dinh,
          dia_diem: randomItem(LOCATIONS),
          ngay_bd: startDate,
          ngay_kt: endDate,
          han_dk: registrationDeadline,
          sl_toi_da: randomInt(30, 100),
          don_vi_to_chuc: randomItem(ORGANIZATIONS),
          yeu_cau_tham_gia: `Sinh viên lớp ${classData.ten_lop}`,
          trang_thai: 'da_duyet',
          nguoi_tao_id: creator.id,
          co_chung_chi: Math.random() > 0.7,
          hoc_ky: Math.random() > 0.5 ? 'hoc_ky_1' : 'hoc_ky_2',
          nam_hoc: classData.nien_khoa,
          hinh_anh: [],
          tep_dinh_kem: []
        }
      });
      
      activities.push(activity);
      
      if ((i + 1) % 20 === 0) {
        console.log(`   ✅ Đã tạo ${i + 1}/${numActivities} hoạt động`);
      }
    } catch (error) {
      console.error(`   ❌ Lỗi khi tạo hoạt động ${activityCode}:`, error.message);
    }
  }
  
  console.log(`   ✅ Hoàn thành tạo ${activities.length} hoạt động cho lớp ${classData.ten_lop}`);
  return activities;
}

// Hàm đăng ký hoạt động cho sinh viên
async function registerActivitiesForStudents(classData, activities) {
  console.log(`\n📋 Đang đăng ký hoạt động cho sinh viên lớp ${classData.ten_lop}...`);
  
  // Lấy danh sách sinh viên trong lớp
  const students = await prisma.sinhVien.findMany({
    where: {
      lop_id: classData.id
    },
    include: {
      nguoi_dung: {
        select: {
          ho_ten: true,
          ten_dn: true
        }
      }
    }
  });
  
  if (students.length === 0) {
    console.log(`   ⚠️  Không có sinh viên trong lớp ${classData.ten_lop}`);
    return;
  }
  
  console.log(`   👥 Tìm thấy ${students.length} sinh viên`);
  
  let totalRegistrations = 0;
  
  for (const student of students) {
    // Mỗi sinh viên đăng ký 10-20 hoạt động
    const numRegistrations = randomInt(10, 20);
    
    // Chọn ngẫu nhiên các hoạt động để đăng ký
    const shuffledActivities = [...activities].sort(() => Math.random() - 0.5);
    const selectedActivities = shuffledActivities.slice(0, numRegistrations);
    
    for (const activity of selectedActivities) {
      try {
        // Kiểm tra xem đã đăng ký chưa
        const existingReg = await prisma.dangKyHoatDong.findUnique({
          where: {
            sv_id_hd_id: {
              sv_id: student.id,
              hd_id: activity.id
            }
          }
        });
        
        if (existingReg) {
          continue;
        }
        
        // Tạo đăng ký mới
        const registrationDate = new Date(activity.ngay_bd.getTime() - randomInt(5, 15) * 24 * 60 * 60 * 1000);
        const status = randomItem(['da_duyet', 'da_duyet', 'da_duyet', 'cho_duyet']); // 75% được duyệt
        
        await prisma.dangKyHoatDong.create({
          data: {
            sv_id: student.id,
            hd_id: activity.id,
            ngay_dang_ky: registrationDate,
            trang_thai_dk: status,
            ly_do_dk: `Đăng ký tham gia ${activity.ten_hd}`,
            ngay_duyet: status === 'da_duyet' ? new Date(registrationDate.getTime() + randomInt(1, 3) * 24 * 60 * 60 * 1000) : null
          }
        });
        
        totalRegistrations++;
      } catch (error) {
        // Bỏ qua lỗi trùng lặp hoặc lỗi khác
        if (!error.message.includes('Unique constraint')) {
          console.error(`   ❌ Lỗi đăng ký:`, error.message);
        }
      }
    }
  }
  
  console.log(`   ✅ Đã tạo ${totalRegistrations} đăng ký hoạt động cho ${students.length} sinh viên`);
}

// Hàm chính
async function main() {
  console.log('🚀 BẮT ĐẦU KIỂM TRA VÀ THÊM DỮ LIỆU MẪU\n');
  
  try {
    // Bước 1: Kiểm tra dữ liệu hiện tại
    const { classes } = await checkCurrentData();
    
    if (classes.length === 0) {
      console.log('\n❌ Không có lớp nào trong hệ thống. Vui lòng thêm lớp trước!');
      return;
    }
    
    // Bước 2: Lấy danh sách loại hoạt động
    const activityTypes = await prisma.loaiHoatDong.findMany();
    
    if (activityTypes.length === 0) {
      console.log('\n❌ Không có loại hoạt động nào. Vui lòng thêm loại hoạt động trước!');
      return;
    }
    
    console.log(`\n📋 Tìm thấy ${activityTypes.length} loại hoạt động`);
    
    // Bước 3: Tìm người tạo (admin hoặc giảng viên)
    const creator = await prisma.nguoiDung.findFirst({
      where: {
        OR: [
          { ten_dn: { contains: 'admin' } },
          { email: { contains: 'admin' } }
        ]
      }
    });
    
    if (!creator) {
      console.log('\n❌ Không tìm thấy tài khoản admin để tạo hoạt động!');
      return;
    }
    
    console.log(`\n👤 Người tạo hoạt động: ${creator.ho_ten || creator.ten_dn}`);
    
    // Bước 4: Tạo hoạt động và đăng ký cho từng lớp
    console.log('\n=== BẮT ĐẦU TẠO HOẠT ĐỘNG CHO TỪNG LỚP ===');
    
    for (const classData of classes) {
      console.log(`\n${'='.repeat(60)}`);
      console.log(`📚 XỬ LÝ LỚP: ${classData.ten_lop}`);
      console.log(`${'='.repeat(60)}`);
      
      // Tạo hoạt động cho lớp
      const activities = await createActivitiesForClass(classData, activityTypes, creator);
      
      if (activities.length > 0) {
        // Đăng ký hoạt động cho sinh viên trong lớp
        await registerActivitiesForStudents(classData, activities);
      }
      
      console.log(`\n✅ Hoàn thành xử lý lớp ${classData.ten_lop}`);
    }
    
    // Bước 5: Hiển thị tổng kết
    console.log('\n' + '='.repeat(60));
    console.log('🎉 HOÀN THÀNH THÊM DỮ LIỆU MẪU');
    console.log('='.repeat(60));
    
    const finalActivityCount = await prisma.hoatDong.count();
    const finalRegistrationCount = await prisma.dangKyHoatDong.count();
    
    console.log(`\n📊 TỔNG KẾT:`);
    console.log(`   - Tổng số hoạt động: ${finalActivityCount}`);
    console.log(`   - Tổng số đăng ký: ${finalRegistrationCount}`);
    
    // Thống kê chi tiết theo lớp
    console.log('\n📈 THỐNG KÊ CHI TIẾT THEO LỚP:');
    for (const classData of classes) {
      const classActivities = await prisma.hoatDong.count({
        where: {
          ten_hd: {
            contains: classData.ten_lop
          }
        }
      });
      
      const classStudents = await prisma.sinhVien.count({
        where: {
          lop_id: classData.id
        }
      });
      
      const classRegistrations = await prisma.dangKyHoatDong.count({
        where: {
          sinh_vien: {
            lop_id: classData.id
          }
        }
      });
      
      console.log(`\n   📌 ${classData.ten_lop}:`);
      console.log(`      - Số hoạt động: ${classActivities}`);
      console.log(`      - Số sinh viên: ${classStudents}`);
      console.log(`      - Số đăng ký: ${classRegistrations}`);
      if (classStudents > 0) {
        console.log(`      - TB đăng ký/SV: ${(classRegistrations / classStudents).toFixed(1)}`);
      }
    }
    
  } catch (error) {
    console.error('\n❌ LỖI:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Chạy script
main()
  .then(() => {
    console.log('\n✅ Script hoàn thành!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Script thất bại:', error);
    process.exit(1);
  });
