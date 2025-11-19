#!/usr/bin/env node

/**
 * Script to create activities for each class
 * Each class will have:
 * - 20 activities for HK1 (Semester 1)
 * - 20 activities for HK2 (Semester 2)
 * For years 2025 and 2026
 */

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Activity name templates
const activityNames = [
  'Hội thảo chuyên đề {subject}',
  'Tọa đàm {topic}',
  'Workshop {skill}',
  'Cuộc thi {competition}',
  'Chương trình giao lưu {event}',
  'Sinh hoạt lớp chủ nhiệm',
  'Hoạt động từ thiện {charity}',
  'Tham quan {place}',
  'Tình nguyện {volunteer}',
  'Đào tạo kỹ năng {skill}',
  'Hội nghị {conference}',
  'Seminar {subject}',
  'Trải nghiệm thực tế {field}',
  'Hoạt động văn hóa {culture}',
  'Chương trình thể thao {sport}',
  'Buổi gặp gỡ {meeting}',
  'Hoạt động nghệ thuật {art}',
  'Chiến dịch {campaign}',
  'Ngày hội {festival}',
  'Sinh hoạt {activity}',
];

const subjects = ['Công nghệ', 'Khoa học', 'Kinh tế', 'Xã hội', 'Môi trường', 'Giáo dục'];
const topics = ['Nghề nghiệp', 'Khởi nghiệp', 'Phát triển bản thân', 'Tương lai', 'Xu hướng mới'];
const skills = ['Lãnh đạo', 'Giao tiếp', 'Làm việc nhóm', 'Quản lý thời gian', 'Tư duy sáng tạo'];
const competitions = ['Nghiên cứu khoa học', 'Ý tưởng khởi nghiệp', 'Tài năng', 'Học thuật'];
const events = ['Sinh viên', 'Cựu sinh viên', 'Doanh nghiệp', 'Trường bạn'];
const charities = ['Cộng đồng', 'Trẻ em vùng cao', 'Người nghèo', 'Học sinh khó khăn'];
const places = ['Doanh nghiệp', 'Viện nghiên cứu', 'Bảo tàng', 'Di tích lịch sử'];
const volunteers = ['Môi trường', 'Cộng đồng', 'Giáo dục', 'Y tế'];
const conferences = ['Sinh viên toàn quốc', 'Khoa học công nghệ', 'Nghiên cứu'];
const fields = ['Doanh nghiệp', 'Sản xuất', 'Nghiên cứu'];
const cultures = ['Truyền thống', 'Dân gian', 'Hiện đại'];
const sports = ['Sinh viên', 'Chào năm mới', 'Sức khỏe'];
const meetings = ['Doanh nhân', 'Chuyên gia', 'Nhà khoa học'];
const arts = ['Văn nghệ', 'Âm nhạc', 'Hội họa', 'Nhiếp ảnh'];
const campaigns = ['Bảo vệ môi trường', 'An toàn giao thông', 'Hiến máu nhân đạo'];
const festivals = ['Văn hóa', 'Khoa học', 'Sinh viên', 'Nghề nghiệp'];
const activities = ['Ngoại khóa', 'Câu lạc bộ', 'Đội nhóm', 'Tập thể'];

// Description templates
const descriptions = [
  'Hoạt động nhằm nâng cao kiến thức và kỹ năng cho sinh viên.',
  'Tạo điều kiện để sinh viên giao lưu, học hỏi kinh nghiệm.',
  'Phát triển năng lực chuyên môn và kỹ năng mềm.',
  'Góp phần rèn luyện ý thức cộng đồng và trách nhiệm xã hội.',
  'Hoạt động bổ ích giúp sinh viên phát triển toàn diện.',
];

// Locations
const locations = [
  'Hội trường A',
  'Hội trường B',
  'Hội trường C',
  'Phòng hội thảo 101',
  'Phòng hội thảo 201',
  'Sân vận động',
  'Khu thể thao',
  'Thư viện trường',
  'Giảng đường lớn',
  'Phòng sinh hoạt khoa',
  'Khuôn viên trường',
  'Quảng trường',
  'Nhà văn hóa sinh viên',
  'Trung tâm học liệu',
  'Khu ký túc xá',
];

// Organizing units
const organizingUnits = [
  'Phòng Công tác sinh viên',
  'Đoàn Thanh niên',
  'Hội Sinh viên',
  'Khoa Công nghệ thông tin',
  'Khoa Kinh tế',
  'Khoa Ngoại ngữ',
  'Câu lạc bộ Sinh viên',
  'Ban Chấp hành Liên chi hội',
  'Trung tâm Hỗ trợ sinh viên',
  'Phòng Đào tạo',
];

// Requirements
const requirements = [
  'Sinh viên toàn trường',
  'Sinh viên năm 1, năm 2',
  'Sinh viên năm 3, năm 4',
  'Sinh viên có đăng ký',
  'Tất cả sinh viên đang học tập',
];

function randomChoice(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function generateActivityName() {
  const template = randomChoice(activityNames);
  
  if (template.includes('{subject}')) {
    return template.replace('{subject}', randomChoice(subjects));
  } else if (template.includes('{topic}')) {
    return template.replace('{topic}', randomChoice(topics));
  } else if (template.includes('{skill}')) {
    return template.replace('{skill}', randomChoice(skills));
  } else if (template.includes('{competition}')) {
    return template.replace('{competition}', randomChoice(competitions));
  } else if (template.includes('{event}')) {
    return template.replace('{event}', randomChoice(events));
  } else if (template.includes('{charity}')) {
    return template.replace('{charity}', randomChoice(charities));
  } else if (template.includes('{place}')) {
    return template.replace('{place}', randomChoice(places));
  } else if (template.includes('{volunteer}')) {
    return template.replace('{volunteer}', randomChoice(volunteers));
  } else if (template.includes('{conference}')) {
    return template.replace('{conference}', randomChoice(conferences));
  } else if (template.includes('{field}')) {
    return template.replace('{field}', randomChoice(fields));
  } else if (template.includes('{culture}')) {
    return template.replace('{culture}', randomChoice(cultures));
  } else if (template.includes('{sport}')) {
    return template.replace('{sport}', randomChoice(sports));
  } else if (template.includes('{meeting}')) {
    return template.replace('{meeting}', randomChoice(meetings));
  } else if (template.includes('{art}')) {
    return template.replace('{art}', randomChoice(arts));
  } else if (template.includes('{campaign}')) {
    return template.replace('{campaign}', randomChoice(campaigns));
  } else if (template.includes('{festival}')) {
    return template.replace('{festival}', randomChoice(festivals));
  } else if (template.includes('{activity}')) {
    return template.replace('{activity}', randomChoice(activities));
  }
  
  return template;
}

function generateActivityDate(year, semester, index, totalActivities) {
  let startMonth, endMonth;
  
  if (semester === 'hoc_ky_1') {
    // HK1: September to December
    startMonth = 9;
    endMonth = 12;
  } else {
    // HK2: February to June
    startMonth = 2;
    endMonth = 6;
  }
  
  const monthsRange = endMonth - startMonth + 1;
  const month = startMonth + Math.floor((index / totalActivities) * monthsRange);
  const day = 1 + Math.floor(Math.random() * 28);
  
  const startDate = new Date(year, month - 1, day, 8 + Math.floor(Math.random() * 4), 0);
  
  // Activity duration: 1-4 hours
  const durationHours = 1 + Math.floor(Math.random() * 4);
  const endDate = new Date(startDate);
  endDate.setHours(startDate.getHours() + durationHours);
  
  // Registration deadline: 3-7 days before start
  const deadlineDays = 3 + Math.floor(Math.random() * 5);
  const registrationDeadline = new Date(startDate);
  registrationDeadline.setDate(startDate.getDate() - deadlineDays);
  
  return {
    startDate,
    endDate,
    registrationDeadline,
  };
}

async function main() {
  console.log('🚀 Bắt đầu tạo hoạt động cho các lớp...\n');
  
  // Get all activity types
  const activityTypes = await prisma.loaiHoatDong.findMany();
  if (activityTypes.length === 0) {
    console.error('❌ Không tìm thấy loại hoạt động nào. Vui lòng tạo loại hoạt động trước.');
    return;
  }
  console.log(`✓ Tìm thấy ${activityTypes.length} loại hoạt động`);
  
  // Get all classes
  const classes = await prisma.lop.findMany({
    include: {
      chu_nhiem_rel: true,
    },
  });
  
  if (classes.length === 0) {
    console.error('❌ Không tìm thấy lớp nào trong hệ thống.');
    return;
  }
  console.log(`✓ Tìm thấy ${classes.length} lớp\n`);
  
  // Get admin user as creator
  const adminUser = await prisma.nguoiDung.findFirst({
    where: {
      vai_tro: {
        ten_vt: 'ADMIN',
      },
    },
  });
  
  if (!adminUser) {
    console.error('❌ Không tìm thấy tài khoản ADMIN.');
    return;
  }
  
  const years = [2025, 2026];
  const semesters = ['hoc_ky_1', 'hoc_ky_2'];
  const activitiesPerSemester = 20;
  
  let totalCreated = 0;
  let totalSkipped = 0;
  
  for (const classInfo of classes) {
    console.log(`\n📚 Xử lý lớp: ${classInfo.ten_lop} (${classInfo.khoa})`);
    
    for (const year of years) {
      for (const semester of semesters) {
        const semesterName = semester === 'hoc_ky_1' ? 'HK1' : 'HK2';
        console.log(`  └─ ${semesterName} ${year}:`);
        
        // Check existing activities
        const existingCount = await prisma.hoatDong.count({
          where: {
            nam_hoc: String(year),
            hoc_ky: semester,
            ten_hd: {
              contains: classInfo.ten_lop,
            },
          },
        });
        
        if (existingCount >= activitiesPerSemester) {
          console.log(`     ⊘ Đã có ${existingCount} hoạt động, bỏ qua`);
          totalSkipped += existingCount;
          continue;
        }
        
        const activitiesToCreate = activitiesPerSemester - existingCount;
        
        for (let i = 0; i < activitiesToCreate; i++) {
          const activityType = randomChoice(activityTypes);
          const { startDate, endDate, registrationDeadline } = generateActivityDate(
            year,
            semester,
            i,
            activitiesToCreate
          );
          
          const activityName = `${generateActivityName()} - ${classInfo.ten_lop}`;
          
          try {
            await prisma.hoatDong.create({
              data: {
                ten_hd: activityName,
                mo_ta: randomChoice(descriptions),
                loai_hd_id: activityType.id,
                diem_rl: activityType.diem_mac_dinh,
                dia_diem: randomChoice(locations),
                ngay_bd: startDate,
                ngay_kt: endDate,
                han_dk: registrationDeadline,
                sl_toi_da: 30 + Math.floor(Math.random() * 71), // 30-100
                don_vi_to_chuc: randomChoice(organizingUnits),
                yeu_cau_tham_gia: randomChoice(requirements),
                trang_thai: 'da_duyet',
                nguoi_tao_id: classInfo.chu_nhiem,
                hoc_ky: semester,
                nam_hoc: String(year),
                co_chung_chi: Math.random() > 0.7, // 30% có chứng chỉ
              },
            });
            
            totalCreated++;
            
            if ((i + 1) % 5 === 0 || i === activitiesToCreate - 1) {
              process.stdout.write(`\r     ✓ Đã tạo ${i + 1}/${activitiesToCreate} hoạt động`);
            }
          } catch (error) {
            console.error(`\n     ✗ Lỗi tạo hoạt động: ${error.message}`);
          }
        }
        
        console.log(''); // New line after progress
      }
    }
  }
  
  console.log('\n' + '='.repeat(60));
  console.log(`✅ Hoàn thành!`);
  console.log(`   - Tổng số hoạt động đã tạo: ${totalCreated}`);
  console.log(`   - Hoạt động đã tồn tại: ${totalSkipped}`);
  console.log(`   - Tổng số lớp: ${classes.length}`);
  console.log(`   - Mỗi lớp: ${activitiesPerSemester * semesters.length * years.length} hoạt động (${activitiesPerSemester}/HK × ${semesters.length} HK × ${years.length} năm)`);
  console.log('='.repeat(60));
}

main()
  .catch((error) => {
    console.error('\n❌ Lỗi:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
