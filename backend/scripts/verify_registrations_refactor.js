/**
 * Verify registrations.service.js refactor
 */

console.log('🧪 Verifying registrations.service.js refactor...\n');

let passed = 0;
let failed = 0;

function test(name, fn) {
  try {
    fn();
    console.log(`  ✅ ${name}`);
    passed++;
  } catch (error) {
    console.log(`  ❌ ${name}: ${error.message}`);
    failed++;
  }
}

// Test 1: Import registrations.service
test('Import registrations.service', () => {
  const service = require('../src/modules/registrations/registrations.service');
  if (typeof service !== 'object') throw new Error('Not an object');
});

// Test 2: Check all methods exist
test('Check all methods exist', () => {
  const service = require('../src/modules/registrations/registrations.service');
  const expected = [
    'list', 'getById', 'getMyRegistrations', 'getActivityStats',
    'create', 'register', 'cancel',
    'approve', 'reject', 'checkIn', 'bulkApprove', 'bulkUpdate',
    'exportRegistrations',
    'checkAccess', 'canApproveRegistration', 'canManageActivity'
  ];
  
  expected.forEach(method => {
    if (typeof service[method] !== 'function') {
      throw new Error(`Missing method: ${method}`);
    }
  });
});

// Test 3: Import specialized services
test('Import RegistrationQueryService', () => {
  require('../src/modules/registrations/services/RegistrationQueryService');
});

test('Import RegistrationCRUDService', () => {
  require('../src/modules/registrations/services/RegistrationCRUDService');
});

test('Import RegistrationApprovalService', () => {
  require('../src/modules/registrations/services/RegistrationApprovalService');
});

test('Import RegistrationExportService', () => {
  require('../src/modules/registrations/services/RegistrationExportService');
});

test('Import RegistrationAuthorizationService', () => {
  require('../src/modules/registrations/services/RegistrationAuthorizationService');
});

// Test 4: Check file sizes
test('Check file sizes', () => {
  const fs = require('fs');
  const path = require('path');
  
  const repoPath = path.resolve(__dirname, '..', 'src/modules/registrations/registrations.service.js');
  const content = fs.readFileSync(repoPath, 'utf8');
  const lines = content.split('\n').length;
  
  if (lines > 200) {
    throw new Error(`File too large: ${lines} lines (should be < 200)`);
  }
  
  console.log(`    File size: ${lines} lines (reduced from 604 lines)`);
  console.log(`    Reduction: ${((604 - lines) / 604 * 100).toFixed(1)}%`);
});

console.log(`\n📊 Results: ${passed} passed, ${failed} failed\n`);

if (failed === 0) {
  console.log('✅ All tests passed! Refactor successful!');
  process.exit(0);
} else {
  console.log('❌ Some tests failed!');
  process.exit(1);
}

