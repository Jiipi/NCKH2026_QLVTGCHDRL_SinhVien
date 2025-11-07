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
  try {
    const t = createTransporter();
    const from = process.env.SMTP_FROM || process.env.SMTP_USER || 'no-reply@localhost';
    if (!t) {
      logInfo('MAIL_LOG_ONLY', { to, subject });
      if (process.env.NODE_ENV !== 'production') {
        console.log('[DEV EMAIL Fallback]\nTO:', to, '\nSUBJECT:', subject, '\nTEXT:', text || '', '\nHTML:', html || '');
      }
      return { accepted: [to], rejected: [] };
    }
    const info = await t.sendMail({ from, to, subject, text, html });
    logInfo('MAIL_SENT', { to, messageId: info?.messageId });
    return info;
  } catch (error) {
    logError('MAIL_SEND_FAILED', error, { to, subject });
    throw error;
  }
}

module.exports = { sendMail };
