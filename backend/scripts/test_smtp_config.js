/**
 * Test SMTP Configuration
 * Kiểm tra xem SMTP config có được load đúng không
 */

require('dotenv').config();
require('dotenv').config({ path: '.env.local', override: true });

const { sendMail } = require('../src/core/utils/mailer');

console.log('\n=== SMTP Configuration Check ===\n');

// Check environment variables
const smtpConfig = {
  SMTP_HOST: process.env.SMTP_HOST,
  SMTP_PORT: process.env.SMTP_PORT,
  SMTP_SECURE: process.env.SMTP_SECURE,
  SMTP_USER: process.env.SMTP_USER,
  SMTP_PASS: process.env.SMTP_PASS ? '***SET***' : 'NOT SET',
  SMTP_FROM: process.env.SMTP_FROM,
  SMTP_DEBUG: process.env.SMTP_DEBUG,
  NODE_ENV: process.env.NODE_ENV
};

console.log('Environment Variables:');
Object.entries(smtpConfig).forEach(([key, value]) => {
  const status = value ? '✓' : '✗';
  console.log(`  ${status} ${key}: ${value || 'NOT SET'}`);
});

console.log('\n=== Testing Mailer ===\n');

// Test mailer
async function testMailer() {
  try {
    const testEmail = {
      to: process.env.SMTP_USER || 'test@example.com',
      subject: 'Test Email - SMTP Configuration',
      html: '<p>This is a test email to verify SMTP configuration.</p>',
      text: 'This is a test email to verify SMTP configuration.'
    };

    console.log('Attempting to send test email...');
    console.log('To:', testEmail.to);
    
    const result = await sendMail(testEmail);
    
    console.log('\n✓ Email sent successfully!');
    console.log('Message ID:', result.messageId);
    console.log('Accepted:', result.accepted);
    console.log('Rejected:', result.rejected);
    
  } catch (error) {
    console.error('\n✗ Failed to send email:');
    console.error('Error:', error.message);
    console.error('\nStack:', error.stack);
    
    if (error.message.includes('SMTP configuration is missing')) {
      console.error('\n⚠️  Please check your .env file and ensure:');
      console.error('   - SMTP_HOST is set');
      console.error('   - SMTP_USER is set');
      console.error('   - SMTP_PASS is set');
    }
  }
}

testMailer();

