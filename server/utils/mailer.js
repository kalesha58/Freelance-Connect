const nodemailer = require('nodemailer');

const parseSecure = (value) => String(value || '').toLowerCase() === 'true';

const createTransporter = () => {
    const {
        SMTP_HOST,
        SMTP_PORT,
        SMTP_SECURE,
        SMTP_USER,
        SMTP_PASS
    } = process.env;

    if (!SMTP_HOST || !SMTP_PORT || !SMTP_USER || !SMTP_PASS) {
        throw new Error('SMTP configuration is incomplete. Please set SMTP_HOST, SMTP_PORT, SMTP_USER, and SMTP_PASS.');
    }

    return nodemailer.createTransport({
        host: SMTP_HOST,
        port: Number(SMTP_PORT),
        secure: parseSecure(SMTP_SECURE),
        auth: {
            user: SMTP_USER,
            pass: SMTP_PASS
        }
    });
};

const sendPasswordResetOtpEmail = async ({ to, otp }) => {
    const from = process.env.SMTP_FROM || process.env.SMTP_USER;
    if (!from) {
        throw new Error('SMTP_FROM or SMTP_USER must be configured for sender address.');
    }

    const transporter = createTransporter();

    const subject = 'Your Freelance Connect password reset code';
    const text = `Your password reset code is ${otp}. This code will expire in 10 minutes.`;
    const html = `
        <div style="font-family: Arial, sans-serif; line-height: 1.6;">
            <h2>Password Reset Request</h2>
            <p>Use the verification code below to reset your password:</p>
            <p style="font-size: 24px; letter-spacing: 4px; font-weight: bold;">${otp}</p>
            <p>This code will expire in <strong>10 minutes</strong>.</p>
            <p>If you did not request this, you can ignore this email.</p>
        </div>
    `;

    await transporter.sendMail({
        from,
        to,
        subject,
        text,
        html
    });
};

module.exports = {
    sendPasswordResetOtpEmail
};
