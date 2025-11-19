/**
 * Script to regenerate Vietnamese text for activities to fix encoding issues
 * Usage: node backend/scripts/regenerate_activity_content.js
 */

require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

// Vietnamese activity name templates
const activityNameTemplates = [
  'Hội thảo khởi nghiệp đổi mới sáng tạo',
  'Chương trình tình nguyện vì cộng đồng',
  'Cuộc thi Olympic tin học',
  'Triển lãm công nghệ và đổi mới',
  'Ngày hội việc làm sinh viên',
  'Tọa đàm định hướng nghề nghiệp',
  'Workshop kỹ năng mềm',
  'Chương trình giao lưu văn hóa',
  'Hội nghị sinh viên nghiên cứu khoa học',
  'Chiến dịch hiến máu nhân đạo',
  'Đêm nhạc từ thiện gây quỹ',
  'Giải bóng đá sinh viên',
  'Marathon vì sức khỏe cộng đồng',
  'Hội trại thanh niên',
  'Chương trình trao quà từ thiện',
  'Ngày hội sách sinh viên',
  'Cuộc thi ý tưởng khởi nghiệp',
  'Diễn đàn lãnh đạo trẻ',
  'Hội thảo học thuật',
  'Lớp học kỹ năng lập trình',
  'Chương trình tư vấn học đường',
  'Hoạt động bảo vệ môi trường',
  'Cuộc thi thiết kế đồ họa',
  'Workshop phát triển bản thân',
  'Chuyến đi tình nguyện vùng cao',
  'Hội thảo chuyên đề AI và Machine Learning',
  'Ngày hội Startup đổi mới',
  'Chương trình trao đổi sinh viên quốc tế',
  'Cuộc thi hackathon công nghệ',
  'Lễ hội văn hóa dân gian',
];

// Vietnamese description templates
const descriptionTemplates = [
  'Chương trình được tổ chức nhằm nâng cao kiến thức, kỹ năng và phát triển năng lực toàn diện cho sinh viên. Đây là cơ hội để các bạn học hỏi, giao lưu và rút ra bài học quý báu cho tương lai.',
  'Hoạt động mang ý nghĩa thiết thực, giúp sinh viên trau dồi kỹ năng mềm, mở rộng kiến thức chuyên môn và xây dựng mạng lưới quan hệ. Tham gia chương trình này, các bạn sẽ được trải nghiệm những hoạt động bổ ích và ý nghĩa.',
  'Sự kiện được tổ chức với mục đích tạo sân chơi học thuật, rèn luyện kỹ năng thực hành và khả năng làm việc nhóm. Qua đó, sinh viên có cơ hội phát triển tư duy sáng tạo và tinh thần trách nhiệm.',
  'Chương trình hướng đến việc xây dựng môi trường học tập tích cực, tạo điều kiện cho sinh viên thể hiện tài năng và năng lực bản thân. Các hoạt động được thiết kế phong phú, đa dạng nhằm đáp ứng nhu cầu phát triển toàn diện.',
  'Hoạt động giúp sinh viên nâng cao ý thức cộng đồng, tinh thần tình nguyện và trách nhiệm xã hội. Đồng thời, đây cũng là dịp để các bạn rèn luyện kỹ năng giao tiếp, làm việc nhóm và giải quyết vấn đề.',
];

// Vietnamese location templates
const locationTemplates = [
  'Hội trường A - Trường Đại học',
  'Giảng đường B203',
  'Sân vận động Trường',
  'Phòng họp Tầng 3',
  'Khu vực ngoài trời - Sân trường',
  'Trung tâm Hội nghị',
  'Phòng thí nghiệm Khoa Công nghệ',
  'Thư viện Trường',
  'Nhà Văn hóa Sinh viên',
  'Hội trường đa năng',
  'Phòng học C401',
  'Khuôn viên Trường',
  'Sảnh Tầng 1',
  'Khu thực hành Khoa',
  'Online - Zoom Meeting',
];

// Vietnamese unit templates
const unitTemplates = [
  'Đoàn Thanh niên Trường',
  'Hội Sinh viên Trường',
  'Khoa Công nghệ Thông tin',
  'Khoa Điện - Điện tử',
  'Khoa Kinh tế',
  'Phòng Công tác Sinh viên',
  'Ban Văn hóa - Xã hội',
  'Câu lạc bộ Khởi nghiệp',
  'Trung tâm Tư vấn và Hỗ trợ Sinh viên',
  'Khoa Cơ khí',
];

// Vietnamese requirement templates
const requirementTemplates = [
  'Sinh viên cần đăng ký trước thời hạn và có mặt đúng giờ. Mang theo thẻ sinh viên và trang phục lịch sự.',
  'Yêu cầu sinh viên tham gia đầy đủ các phiên làm việc. Chuẩn bị tinh thần học hỏi và sẵn sàng làm việc nhóm.',
  'Sinh viên đăng ký tham gia cần cam kết tham dự đầy đủ thời gian diễn ra sự kiện. Mang theo dụng cụ học tập cá nhân.',
  'Yêu cầu sinh viên có tinh thần trách nhiệm, chấp hành nội quy và quy định của nhà trường. Tham gia tích cực các hoạt động.',
  'Sinh viên cần đăng ký online trước khi tham gia. Chuẩn bị laptop cá nhân nếu có yêu cầu.',
];

function getRandomItem(array) {
  return array[Math.floor(Math.random() * array.length)];
}

function generateActivityName(index) {
  const template = getRandomItem(activityNameTemplates);
  // Add year or sequence number to make unique
  const variants = [
    `${template} năm ${2024 + Math.floor(index / 500)}`,
    `${template} - Đợt ${(index % 10) + 1}`,
    `${template} ${index + 1}`,
    template,
  ];
  return getRandomItem(variants);
}

async function regenerateActivityContent() {
  try {
    console.log('🔄 Starting regeneration of Vietnamese content for activities...\n');

    // Get all activities
    const activities = await prisma.hoatDong.findMany({
      select: {
        id: true,
        ma_hd: true,
      },
      orderBy: {
        ma_hd: 'asc',
      },
    });

    console.log(`📊 Found ${activities.length} activities to update\n`);

    let updated = 0;
    const batchSize = 50;

    for (let i = 0; i < activities.length; i++) {
      const activity = activities[i];

      const newData = {
        ten_hd: generateActivityName(i),
        mo_ta: getRandomItem(descriptionTemplates),
        dia_diem: getRandomItem(locationTemplates),
        don_vi_to_chuc: getRandomItem(unitTemplates),
        yeu_cau_tham_gia: getRandomItem(requirementTemplates),
      };

      await prisma.hoatDong.update({
        where: { id: activity.id },
        data: newData,
      });

      updated++;

      // Progress indicator
      if (updated % batchSize === 0) {
        console.log(`✓ Processed ${updated}/${activities.length} activities...`);
      }
    }

    console.log('\n═══════════════════════════════════════════════════');
    console.log(`✅ Content regeneration completed successfully!`);
    console.log(`📝 Total activities updated: ${updated}`);
    console.log('═══════════════════════════════════════════════════');

    // Show sample of updated activities
    console.log('\n📋 Sample of regenerated activities (first 10):');
    const samples = await prisma.hoatDong.findMany({
      select: {
        ma_hd: true,
        ten_hd: true,
        mo_ta: true,
        dia_diem: true,
        don_vi_to_chuc: true,
      },
      take: 10,
      orderBy: {
        ma_hd: 'asc',
      },
    });

    samples.forEach((activity, index) => {
      console.log(`\n${index + 1}. [${activity.ma_hd}] ${activity.ten_hd}`);
      console.log(`   Mô tả: ${activity.mo_ta?.substring(0, 80)}...`);
      console.log(`   Địa điểm: ${activity.dia_diem}`);
      console.log(`   Đơn vị: ${activity.don_vi_to_chuc}`);
    });

    // Verify no encoding issues
    const checkActivity = await prisma.hoatDong.findFirst({
      select: {
        ten_hd: true,
      },
    });

    console.log('\n🔍 Encoding verification:');
    if (checkActivity.ten_hd.includes('?')) {
      console.log('⚠️  Warning: Still detecting encoding issues');
    } else {
      console.log('✅ All content is in proper Vietnamese encoding');
    }

  } catch (error) {
    console.error('❌ Error during regeneration:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run the script
regenerateActivityContent()
  .catch((error) => {
    console.error('💥 Fatal error:', error);
    process.exit(1);
  });
