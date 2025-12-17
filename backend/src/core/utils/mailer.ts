/**
 * Mailer Utility
 * Email sending functionality using nodemailer
 * @module core/utils/mailer
 */

import nodemailer, { Transporter, SentMessageInfo } from 'nodemailer';
import { logError, logInfo } from '../logger';

/**
 * Email options interface
 */
export interface EmailOptions {
  to: string;
  subject: string;
  html?: string;
  text?: string;
}

let transporter: Transporter | null = null;

/**
 * Create or get nodemailer transporter
 */
function createTransporter(): Transporter | null {
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
    }).catch((e: Error) => {
      logError('MAILER_VERIFY_FAILED', e, { host, port, secure });
    });
  }

  return transporter;
}

/**
 * Send an email
 * @param options - Email options (to, subject, html, text)
 * @returns nodemailer SentMessageInfo
 * @throws Error if SMTP is not configured or sending fails
 */
export async function sendMail(options: EmailOptions): Promise<SentMessageInfo> {
  const { to, subject, html, text } = options;
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
    const err = error as Error & { code?: string; response?: string };
    console.error('[Mailer] Email send failed:', err.message);
    console.error('[Mailer] Error code:', err.code);
    console.error('[Mailer] Error response:', err.response);
    logError('MAIL_SEND_FAILED', err, { to, subject, from });
    throw error;
  }
}

// CommonJS compatibility
module.exports = { sendMail };
