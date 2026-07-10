const nodemailer = require('nodemailer');
require('dotenv').config();

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
        await transporter.verify();
        console.log('email server is ready to send message');
        return true;
    } catch (error) {
        console.error('email server connection failed: ',error.message);
        return false;
    }
};
async function sendEmail(options) {
    try {
        const mailOptions = {
            from: `"DAVV Visiting Faculty System" <${process.env.SMTP_USER}>`,
            to: options.to,
            subject: options.subject,
            text: options.text || '',
            html: options.html || '',
            attachments: options.attachments || []
        };
        const info = await transporter.sendMail(mailOptions);
         console.log(`📧 Email sent to ${options.to}: ${info.messageId}`);
        return {
            success: true,
            messageId: info.messageId,
            response: info.response
        };
    } catch (error) {
         console.error('❌ Email sending failed:', error);
        return {
            success: false,
            error: error.message
        };
    }

}

module.exports = sendEmail;