const nodemailer = require('nodemailer');
require('dotenv').config();

// Log email config at startup (mask password)
console.log('[EmailService] Config:', {
    host: process.env.SMTP_HOST || '(not set)',
    port: process.env.SMTP_PORT || '(not set)',
    user: process.env.SMTP_USER || '(not set)',
    pass: process.env.SMTP_PASS ? '****' + process.env.SMTP_PASS.slice(-4) : '(not set)',
    secure: process.env.SMTP_SECURE || '(not set)'
});

function createTransporter(){
    if(process.env.SMTP_HOST === 'smtp.gmail.com'){
        return nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.SMTP_USER,
                pass: process.env.SMTP_PASS
            }
        });
    }

    return nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: parseInt(process.env.SMTP_PORT),
        secure: process.env.SMTP_SECURE === 'true',
        auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASS
        },
        tls: {
            rejectUnauthorized: false
        }
    });
};
const transporter = createTransporter();


async function testEmailConnection(){
    try {
        console.log('[EmailService] Verifying SMTP connection...');
        await transporter.verify();
        console.log('[EmailService] ✅ SMTP connection verified - ready to send');
        return { success: true, message: 'SMTP connection verified' };
    } catch (error) {
        console.error('[EmailService] ❌ SMTP connection FAILED:', error.message);
        console.error('[EmailService] Full error:', JSON.stringify({
            code: error.code,
            command: error.command,
            responseCode: error.responseCode,
            response: error.response,
            message: error.message
        }));
        return { success: false, error: error.message, code: error.code };
    }
};
async function sendEmail(options) {
    try {
        console.log(`[EmailService] Attempting to send email to: ${options.to}, subject: "${options.subject}"`);
        const mailOptions = {
            from: `"DAVV Visiting Faculty System" <${process.env.SMTP_USER}>`,
            to: options.to,
            subject: options.subject,
            text: options.text || '',
            html: options.html || '',
            attachments: options.attachments || []
        };
        const info = await transporter.sendMail(mailOptions);
        console.log(`[EmailService] 📧 Email sent to ${options.to}: ${info.messageId}`);
        return {
            success: true,
            messageId: info.messageId,
            response: info.response
        };
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