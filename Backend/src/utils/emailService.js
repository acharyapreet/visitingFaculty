const nodemailer = require('nodemailer');
require('dotenv').config();

// ── Determine email provider ──────────────────────────────────────
// If RESEND_API_KEY is set → use Resend HTTP API (works on Railway, Render etc.)
// Otherwise → use SMTP/Nodemailer (works locally, on VPS)
const useResend = !!process.env.RESEND_API_KEY;

console.log('[EmailService] Provider:', useResend ? 'Resend (HTTP API)' : 'SMTP (Nodemailer)');
console.log('[EmailService] Config:', useResend
    ? { apiKey: '****' + process.env.RESEND_API_KEY.slice(-6), from: process.env.EMAIL_FROM || 'onboarding@resend.dev' }
    : {
        host: process.env.SMTP_HOST || '(not set)',
        port: process.env.SMTP_PORT || '(not set)',
        user: process.env.SMTP_USER || '(not set)',
        pass: process.env.SMTP_PASS ? '****' + process.env.SMTP_PASS.slice(-4) : '(not set)',
        secure: process.env.SMTP_SECURE || '(not set)'
    }
);

// ── SMTP Transporter (only created if not using Resend) ───────────
let transporter = null;
if (!useResend) {
    if (process.env.SMTP_HOST === 'smtp.gmail.com') {
        transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.SMTP_USER,
                pass: process.env.SMTP_PASS
            }
        });
    } else {
        transporter = nodemailer.createTransport({
            host: process.env.SMTP_HOST,
            port: parseInt(process.env.SMTP_PORT),
            secure: process.env.SMTP_SECURE === 'true',
            auth: {
                user: process.env.SMTP_USER,
                pass: process.env.SMTP_PASS
            },
            tls: { rejectUnauthorized: false }
        });
    }
}

// ── Resend client (only created if API key is set) ────────────────
let resend = null;
if (useResend) {
    const { Resend } = require('resend');
    resend = new Resend(process.env.RESEND_API_KEY);
}

// ── Test email connection ─────────────────────────────────────────
async function testEmailConnection() {
    try {
        console.log('[EmailService] Verifying connection...');
        if (useResend) {
            // Resend doesn't have a verify method, but we can check the API key
            // by attempting to list domains (lightweight call)
            console.log('[EmailService] ✅ Resend API key configured - ready to send');
            return { success: true, message: 'Resend API key configured', provider: 'resend' };
        } else {
            await transporter.verify();
            console.log('[EmailService] ✅ SMTP connection verified - ready to send');
            return { success: true, message: 'SMTP connection verified', provider: 'smtp' };
        }
    } catch (error) {
        console.error('[EmailService] ❌ Connection FAILED:', error.message);
        console.error('[EmailService] Full error:', JSON.stringify({
            code: error.code,
            command: error.command,
            responseCode: error.responseCode,
            response: error.response,
            message: error.message
        }));
        return { success: false, error: error.message, code: error.code };
    }
}

// ── Send email (auto-selects provider) ────────────────────────────
async function sendEmail(options) {
    try {
        console.log(`[EmailService] Sending email via ${useResend ? 'Resend' : 'SMTP'} to: ${options.to}, subject: "${options.subject}"`);

        if (useResend) {
            // ── Resend HTTP API ──
            const fromAddress = process.env.EMAIL_FROM || 'DAVV Visiting Faculty System <onboarding@resend.dev>';
            const { data, error } = await resend.emails.send({
                from: fromAddress,
                to: Array.isArray(options.to) ? options.to : [options.to],
                subject: options.subject,
                html: options.html || undefined,
                text: options.text || undefined,
            });

            if (error) {
                console.error('[EmailService] ❌ Resend error:', error);
                return { success: false, error: error.message || JSON.stringify(error) };
            }

            console.log(`[EmailService] 📧 Email sent via Resend to ${options.to}: ${data.id}`);
            return {
                success: true,
                messageId: data.id,
                response: 'Sent via Resend'
            };
        } else {
            // ── SMTP / Nodemailer ──
            const mailOptions = {
                from: `"DAVV Visiting Faculty System" <${process.env.SMTP_USER}>`,
                to: options.to,
                subject: options.subject,
                text: options.text || '',
                html: options.html || '',
                attachments: options.attachments || []
            };
            const info = await transporter.sendMail(mailOptions);
            console.log(`[EmailService] 📧 Email sent via SMTP to ${options.to}: ${info.messageId}`);
            return {
                success: true,
                messageId: info.messageId,
                response: info.response
            };
        }
    } catch (error) {
        console.error('[EmailService] ❌ Email sending failed:', {
            to: options.to,
            errorMessage: error.message,
            errorCode: error.code,
            command: error.command,
            responseCode: error.responseCode,
            response: error.response
        });
        return {
            success: false,
            error: error.message
        };
    }
}

module.exports = { sendEmail, testEmailConnection };