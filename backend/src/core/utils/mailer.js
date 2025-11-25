// src/utils/mailer.js
const nodemailer = require('nodemailer');
const { logError, logInfo } = require('./logger');

let transporter = null;

function createTransporter() {
  if (transporter) return transporter;
  const host = process.env.SMTP_HOST;
  const port = Number(process.env.SMTP_PORT || 587);
  const secure = String(process.env.SMTP_SECURE || '').toLowerCase() === 'true';
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;

  if (!host || !user || !pass) {
    logInfo('MAILER_DISABLED', { reason: 'Missing SMTP config, will log emails instead' });
    transporter = null;
    return null;
  }

  const debug = String(process.env.SMTP_DEBUG || '').toLowerCase() === 'true';
  transporter = nodemailer.createTransport({
    host,
    port,
    secure,
    auth: { user, pass },
    tls: {
      rejectUnauthorized: process.env.NODE_ENV === 'production'
    }
  });
  if (debug) {
    transporter.verify().then(() => {
      logInfo('MAILER_READY', { host, port, secure });
    }).catch((e) => {
      logError('MAILER_VERIFY_FAILED', e, { host, port, secure });
    });
  }
  return transporter;
}

async function sendMail({ to, subject, html, text }) {
  const t = createTransporter();
  const from = process.env.SMTP_FROM || process.env.SMTP_USER || 'no-reply@localhost';
  
  if (!t) {
    const errorMsg = 'SMTP configuration is missing. Please set SMTP_HOST, SMTP_USER, and SMTP_PASS in environment variables.';
    logError('MAILER_CONFIG_MISSING', new Error(errorMsg), { 
      hasHost: !!process.env.SMTP_HOST,
      hasUser: !!process.env.SMTP_USER,
      hasPass: !!process.env.SMTP_PASS,
      to, 
      subject 
    });
    
    // In development, log to console for debugging
    if (process.env.NODE_ENV !== 'production') {
      console.error('\n[EMAIL ERROR] SMTP not configured!');
      console.error('Missing environment variables:');
      console.error('  - SMTP_HOST:', process.env.SMTP_HOST || 'NOT SET');
      console.error('  - SMTP_USER:', process.env.SMTP_USER || 'NOT SET');
      console.error('  - SMTP_PASS:', process.env.SMTP_PASS ? '***SET***' : 'NOT SET');
      console.error('\n[DEV EMAIL Fallback - Email NOT sent]\nTO:', to, '\nSUBJECT:', subject, '\nTEXT:', text || '', '\nHTML:', html || '');
    }
    
    // Throw error to prevent silent failure
    throw new Error(errorMsg);
  }
  
  try {
    console.log('[Mailer] Sending email:', { to, from, subject });
    const info = await t.sendMail({ from, to, subject, text, html });
    console.log('[Mailer] Email sent successfully:', {
      messageId: info?.messageId,
      accepted: info?.accepted,
      rejected: info?.rejected,
      response: info?.response
    });
    logInfo('MAIL_SENT', { to, messageId: info?.messageId, from });
    return info;
  } catch (error) {
    console.error('[Mailer] Email send failed:', error.message);
    console.error('[Mailer] Error code:', error.code);
    console.error('[Mailer] Error response:', error.response);
    logError('MAIL_SEND_FAILED', error, { to, subject, from });
    throw error;
  }
}

module.exports = { sendMail };




