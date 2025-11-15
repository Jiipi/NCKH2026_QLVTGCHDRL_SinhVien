// Debug script to find the error
console.log('Starting backend with detailed error logging...\n');

try {
  require('./src/index.js');
} catch (error) {
  console.error('\n❌ FATAL ERROR during startup:');
  console.error('Message:', error.message);
  console.error('Stack:', error.stack);
  process.exit(1);
}


