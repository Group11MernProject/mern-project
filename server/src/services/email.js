import nodemailer from 'nodemailer';
import { config } from '../config.js';

function createTransport() {
  if (!config.smtp.host || !config.smtp.user) return null;
  return nodemailer.createTransport({
    host: config.smtp.host,
    port: config.smtp.port,
    secure: config.smtp.port === 465,
    auth: { user: config.smtp.user, pass: config.smtp.pass }
  });
}

export async function sendVerificationEmail({ name, email, token }) {
  const verifyUrl = `${config.appBaseUrl}/verify-email?token=${encodeURIComponent(token)}`;
  const transport = createTransport();

  if (!transport) {
    if (config.env !== 'test') console.info(`[PlatePilot] Verification link for ${email}: ${verifyUrl}`);
    return { previewUrl: verifyUrl };
  }

  await transport.sendMail({
    from: config.smtp.from,
    to: email,
    subject: 'Verify your PlatePilot email',
    text: `Hi ${name}, verify your email: ${verifyUrl}`,
    html: `<div style="font-family:Arial,sans-serif;max-width:520px;margin:auto;padding:32px;color:#24332a"><h1 style="color:#ee6b45">Welcome to PlatePilot</h1><p>Hi ${name},</p><p>Confirm your email to save and sync your weekly meal plans.</p><p><a href="${verifyUrl}" style="display:inline-block;background:#24332a;color:white;text-decoration:none;padding:12px 20px;border-radius:10px">Verify my email</a></p><p>This link expires in 24 hours.</p></div>`
  });

  return {};
}

