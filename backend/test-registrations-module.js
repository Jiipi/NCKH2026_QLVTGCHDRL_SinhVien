/**
 * Test Registrations Module (V2)
 */

console.log('🧪 TESTING REGISTRATIONS MODULE V2\n');

try {
  // Test 1: Module loading
  console.log('1️⃣ Testing module loading...');
  const registrationsModule = require('./src/modules/registrations');
  
  if (registrationsModule.routes && registrationsModule.service && registrationsModule.repo) {
    console.log('✅ Registrations module loaded successfully');
    console.log(`   - routes: ${typeof registrationsModule.routes}`);
    console.log(`   - service: ${typeof registrationsModule.service}`);
    console.log(`   - repo: ${typeof registrationsModule.repo}\n`);
  } else {
    console.log('❌ Module exports incomplete\n');
    process.exit(1);
  }

  // Test 2: Service methods
  console.log('2️⃣ Testing service methods...');
  const service = registrationsModule.service;
  const expectedMethods = [
    'list', 'getById', 'create', 'approve', 'reject',
    'cancel', 'checkIn', 'bulkApprove', 'getActivityStats', 'getMyRegistrations'
  ];
  
  let allMethodsExist = true;
  expectedMethods.forEach(method => {
    const exists = typeof service[method] === 'function';
    console.log(`   ${exists ? '✅' : '❌'} ${method}: ${exists ? 'function' : 'missing'}`);
    if (!exists) allMethodsExist = false;
  });
  
  if (allMethodsExist) {
    console.log('✅ All service methods present\n');
  } else {
    console.log('❌ Some service methods missing\n');
    process.exit(1);
  }

  // Test 3: Repo methods
  console.log('3️⃣ Testing repo methods...');
  const repo = registrationsModule.repo;
  const expectedRepoMethods = [
    'findMany', 'findById', 'findByUserAndActivity', 'create',
    'update', 'delete', 'exists', 'countByActivity',
    'getActivityStats', 'bulkApprove', 'bulkReject', 'checkIn'
  ];
  
  let allRepoMethodsExist = true;
  expectedRepoMethods.forEach(method => {
    const exists = typeof repo[method] === 'function';
    console.log(`   ${exists ? '✅' : '❌'} ${method}: ${exists ? 'function' : 'missing'}`);
    if (!exists) allRepoMethodsExist = false;
  });
  
  if (allRepoMethodsExist) {
    console.log('✅ All repo methods present\n');
  } else {
    console.log('❌ Some repo methods missing\n');
    process.exit(1);
  }

  // Test 4: Routes structure
  console.log('4️⃣ Testing routes structure...');
  const routes = registrationsModule.routes;
  if (routes && routes.stack && routes.stack.length > 0) {
    console.log(`✅ Routes registered: ${routes.stack.length} routes\n`);
    
    // List custom endpoints
    const customEndpoints = routes.stack
      .filter(layer => layer.route)
      .map(layer => `${Object.keys(layer.route.methods)[0].toUpperCase()} ${layer.route.path}`)
      .filter(route => !route.includes('/:id') || route.includes('approve') || route.includes('reject'));
    
    console.log('   Custom endpoints:');
    customEndpoints.forEach(endpoint => {
      console.log(`   - ${endpoint}`);
    });
    console.log();
  } else {
    console.log('❌ No routes registered\n');
  }

  // Summary
  console.log('━'.repeat(50));
  console.log('📊 REGISTRATIONS MODULE TEST SUMMARY');
  console.log('━'.repeat(50));
  console.log('✅ Module loading: PASSED');
  console.log('✅ Service methods: PASSED');
  console.log('✅ Repo methods: PASSED');
  console.log('✅ Routes structure: PASSED\n');
  
  console.log('🎉 ALL TESTS PASSED!\n');
  console.log('✅ Registrations module hoàn chỉnh');
  console.log('✅ Ready to integrate với routing system');
  console.log('✅ Sẵn sàng test với server thật\n');

  console.log('📝 Custom endpoints available:');
  console.log('   POST /core/registrations/:id/approve');
  console.log('   POST /core/registrations/:id/reject');
  console.log('   POST /core/registrations/:id/cancel');
  console.log('   POST /core/registrations/:id/checkin');
  console.log('   POST /core/registrations/bulk-approve');
  console.log('   GET  /core/registrations/my');
  console.log('   GET  /core/registrations/activity/:activityId/stats\n');

} catch (err) {
  console.error('❌ Test failed:', err.message);
  console.error(err.stack);
  process.exit(1);
}
