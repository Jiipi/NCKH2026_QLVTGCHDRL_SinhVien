const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkUserProfile() {
  try {
    const sv = await prisma.sinhVien.findFirst({
      where: { 
        nguoi_dung: { 
          ho_ten: { contains: 'Dang Van Ha', mode: 'insensitive' } 
        } 
      },
      include: { 
        nguoi_dung: { 
          select: { 
            id: true, 
            ho_ten: true, 
            email: true, 
            vai_tro: { 
              select: { ten_vt: true } 
            } 
          } 
        }, 
        lop: { 
          select: { 
            ten_lop: true, 
            khoa: true 
          } 
        } 
      }
    });

    console.log('\n===== THÔNG TIN SV TRONG DB =====');
    console.log('User ID:', sv.nguoi_dung.id);
    console.log('Họ tên:', sv.nguoi_dung.ho_ten);
    console.log('Email:', sv.nguoi_dung.email);
    console.log('MSSV:', sv.mssv);
    console.log('Lớp:', sv.lop.ten_lop);
    console.log('Khoa:', sv.lop.khoa);
    console.log('Vai trò:', sv.nguoi_dung.vai_tro.ten_vt);

    // Kiểm tra luôn xem API auth/profile trả về gì
    console.log('\n===== SIMULATION API RESPONSE (auth/profile) =====');
    const profileResponse = {
      id: sv.nguoi_dung.id,
      ho_ten: sv.nguoi_dung.ho_ten,
      email: sv.nguoi_dung.email,
      vai_tro: sv.nguoi_dung.vai_tro.ten_vt,
      ma_sv: sv.mssv,
      lop: {
        ten_lop: sv.lop.ten_lop,
        khoa: sv.lop.khoa
      }
    };
    console.log(JSON.stringify(profileResponse, null, 2));

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkUserProfile();
