// Test import các module để tìm lỗi
console.log('Testing imports...');

try {
  console.log('1. Testing roleHelper...');
  const roleHelper = require('./src/utils/roleHelper');
  console.log('✅ roleHelper OK');
  
  console.log('2. Testing auth middleware...');
  const auth = require('./src/middlewares/auth');
  console.log('✅ auth middleware OK');
  
  console.log('3. Testing rbac middleware...');
  const rbac = require('./src/middlewares/rbac');
  console.log('✅ rbac middleware OK');
  
  console.log('4. Testing auth.model...');
  const authModel = require('./src/models/auth.model');
  console.log('✅ auth.model OK');
  
  console.log('\n✅ All imports successful!');
} catch (error) {
  console.error('\n❌ Import error:', error.message);
  console.error('Stack:', error.stack);
  process.exit(1);
}

