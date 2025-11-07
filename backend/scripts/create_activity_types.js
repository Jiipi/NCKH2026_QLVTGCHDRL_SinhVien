const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  try {
    console.log('\n🚀 TẠO CÁC LOẠI HOẠT ĐỘNG CHO HỆ THỐNG\n');

    // Lấy admin để làm người tạo
    const admin = await prisma.nguoiDung.findFirst({
      where: {
        vai_tro: {
          ten_vt: { contains: 'admin', mode: 'insensitive' }
        }
      }
    });

    const nguoiTaoId = admin?.id || null;

    const activityTypes = [
      {
        ten_loai_hd: 'Học tập',
        mo_ta: 'Ý thức và kết quả học tập',
        diem_mac_dinh: 5.00,
        diem_toi_da: 25.00,
        mau_sac: '#3B82F6'
      },
      {
        ten_loai_hd: 'Nội quy',
        mo_ta: 'Ý thức và kết quả chấp hành nội quy',
        diem_mac_dinh: 5.00,
        diem_toi_da: 25.00,
        mau_sac: '#10B981'
      },
      {
        ten_loai_hd: 'Tình nguyện',
        mo_ta: 'Hoạt động phong trào, tình nguyện',
        diem_mac_dinh: 5.00,
        diem_toi_da: 25.00,
        mau_sac: '#F59E0B'
      },
      {
        ten_loai_hd: 'Xã hội',
        mo_ta: 'Phẩm chất công dân và quan hệ xã hội',
        diem_mac_dinh: 5.00,
        diem_toi_da: 20.00,
        mau_sac: '#8B5CF6'
      },
      {
        ten_loai_hd: 'Khen thưởng',
        mo_ta: 'Hoạt động khen thưởng, kỷ luật',
        diem_mac_dinh: 5.00,
        diem_toi_da: 5.00,
        mau_sac: '#EF4444'
      }
    ];

    let created = 0;
    let existing = 0;

    for (const type of activityTypes) {
      const exists = await prisma.loaiHoatDong.findFirst({
        where: { ten_loai_hd: type.ten_loai_hd }
      });

      if (exists) {
        console.log(`⚠️  Loại "${type.ten_loai_hd}" đã tồn tại, cập nhật điểm tối đa...`);
        await prisma.loaiHoatDong.update({
          where: { id: exists.id },
          data: {
            diem_toi_da: type.diem_toi_da,
            mau_sac: type.mau_sac
          }
        });
        existing++;
      } else {
        await prisma.loaiHoatDong.create({
          data: {
            ...type,
            nguoi_tao_id: nguoiTaoId
          }
        });
        console.log(`✅ Tạo loại "${type.ten_loai_hd}" - Điểm tối đa: ${type.diem_toi_da}`);
        created++;
      }
    }

    console.log('\n✨ HOÀN THÀNH!\n');
    console.log('=' .repeat(50));
    console.log('📊 THỐNG KÊ:');
    console.log('- Loại mới tạo:', created);
    console.log('- Loại đã tồn tại:', existing);
    console.log('- Tổng cộng:', activityTypes.length);
    console.log('=' .repeat(50));
    
    console.log('\n📋 DANH SÁCH LOẠI HOẠT ĐỘNG:\n');
    const allTypes = await prisma.loaiHoatDong.findMany({
      orderBy: { diem_toi_da: 'desc' }
    });
    
    allTypes.forEach(type => {
      console.log(`- ${type.ten_loai_hd}: Điểm tối đa ${type.diem_toi_da} | Màu ${type.mau_sac || 'N/A'}`);
    });
    
    console.log('\n✅ Tổng điểm tối đa có thể đạt:', 
      allTypes.reduce((sum, t) => sum + Number(t.diem_toi_da), 0));

  } catch (error) {
    console.error('❌ Lỗi:', error.message);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

main();
