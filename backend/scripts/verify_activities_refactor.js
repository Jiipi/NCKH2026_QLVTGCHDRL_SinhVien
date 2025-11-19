/**
 * Verify activities.service.js refactor
 */

console.log('🧪 Verifying activities.service.js refactor...\n');

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

// Test 1: Import activities.service
test('Import activities.service', () => {
  const service = require('../src/modules/activities/activities.service');
  if (typeof service !== 'object') throw new Error('Not an object');
});

// Test 2: Check all methods exist
test('Check all methods exist', () => {
  const service = require('../src/modules/activities/activities.service');
  const expected = [
    'list', 'getById', 'getDetails', 'create', 'update', 'delete',
    'approve', 'reject', 'mapIncomingFields', 'normalizeActivityData',
    'normalizeFileArray', 'validateDates', 'parseSemester',
    'generateQRToken', 'generateQRForActivity',
    'enrichActivitiesWithRegistrations', 'enrichActivity'
  ];
  
  expected.forEach(method => {
    if (typeof service[method] !== 'function') {
      throw new Error(`Missing method: ${method}`);
    }
  });
});

// Test 3: Import specialized services
test('Import ActivityQueryService', () => {
  require('../src/modules/activities/services/ActivityQueryService');
});

test('Import ActivityCRUDService', () => {
  require('../src/modules/activities/services/ActivityCRUDService');
});

test('Import ActivityApprovalService', () => {
  require('../src/modules/activities/services/ActivityApprovalService');
});

test('Import ActivityValidationService', () => {
  require('../src/modules/activities/services/ActivityValidationService');
});

test('Import ActivityQRService', () => {
  require('../src/modules/activities/services/ActivityQRService');
});

test('Import ActivityEnrichmentService', () => {
  require('../src/modules/activities/services/ActivityEnrichmentService');
});

// Test 4: Check file sizes
test('Check file sizes', () => {
  const fs = require('fs');
  const path = require('path');
  
  const repoPath = path.resolve(__dirname, '..', 'src/modules/activities/activities.service.js');
  const content = fs.readFileSync(repoPath, 'utf8');
  const lines = content.split('\n').length;
  
  if (lines > 200) {
    throw new Error(`File too large: ${lines} lines (should be < 200)`);
  }
  
  console.log(`    File size: ${lines} lines (reduced from 665 lines)`);
  console.log(`    Reduction: ${((665 - lines) / 665 * 100).toFixed(1)}%`);
});

console.log(`\n📊 Results: ${passed} passed, ${failed} failed\n`);

if (failed === 0) {
  console.log('✅ All tests passed! Refactor successful!');
  process.exit(0);
} else {
  console.log('❌ Some tests failed!');
  process.exit(1);
}

