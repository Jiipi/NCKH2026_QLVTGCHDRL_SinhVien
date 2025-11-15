// test-login.js
const { prisma } = require('./src/infrastructure/prisma/client');
const AuthService = require('./src/services/auth.service');

async function testLoginLogic() {
  console.log('--- Running Login Logic Test ---');
  const maso = 'admin';
  const password = '123456';

  try {
    // 1. Find user
    console.log(`1. Finding user with maso: '${maso}'`);
    const user = await AuthService.findByEmailOrMaso(maso);
    if (!user) {
      console.error('✗ TEST FAILED: User not found.');
      return;
    }
    console.log('✓ User found:', { id: user.id, ten_dn: user.ten_dn });
    console.log('   Full user object keys:', Object.keys(user));
    console.log('   vai_tro object:', user.vai_tro);

    // 2. Verify password
    console.log(`\n2. Verifying password...`);
    const isPasswordValid = await AuthService.verifyPasswordAndUpgrade(user, password);
    if (!isPasswordValid) {
      console.error('✗ TEST FAILED: Password verification failed.');
      return;
    }
    console.log('✓ Password verified.');

    // 3. Create DTO
    console.log(`\n3. Creating User DTO...`);
    const dto = AuthService.toUserDTO(user);
    if (!dto || !dto.ho_ten || !dto.roleCode) {
      console.error('✗ TEST FAILED: DTO creation failed or DTO is incomplete.');
      console.error('   Generated DTO:', dto);
      return;
    }
    console.log('✓ DTO created successfully:');
    console.log('   - ID:', dto.id);
    console.log('   - Name:', dto.ho_ten);
    console.log('   - Role:', dto.roleCode);

    console.log('\n--- ✅ All Login Logic Tests Passed! ---');
  } catch (error) {
    console.error('\n--- ✗ An unexpected error occurred ---');
    console.error(error);
  } finally {
    await prisma.$disconnect();
  }
}

testLoginLogic();

