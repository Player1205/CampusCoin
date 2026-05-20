"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendVerificationEmail = exports.initTransporter = void 0;
const nodemailer_1 = __importDefault(require("nodemailer"));
let transporter = null;
const initTransporter = async () => {
    if (transporter)
        return transporter;
    if (process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS) {
        transporter = nodemailer_1.default.createTransport({
            host: process.env.SMTP_HOST,
            port: Number(process.env.SMTP_PORT) || 587,
            secure: process.env.SMTP_SECURE === 'true',
            auth: {
                user: process.env.SMTP_USER,
                pass: process.env.SMTP_PASS,
            },
        });
    }
    else {
        console.log('No SMTP credentials found. Falling back to Ethereal Email (mock).');
        try {
            const testAccount = await nodemailer_1.default.createTestAccount();
            transporter = nodemailer_1.default.createTransport({
                host: 'smtp.ethereal.email',
                port: 587,
                secure: false,
                auth: {
                    user: testAccount.user,
                    pass: testAccount.pass,
                },
            });
        }
        catch (err) {
            console.error('Failed to create Ethereal test account:', err);
            throw new Error('Email service initialization failed.');
        }
    }
    return transporter;
};
exports.initTransporter = initTransporter;
const sendVerificationEmail = async (to, otp) => {
    try {
        const t = await (0, exports.initTransporter)();
        const mailOptions = {
            from: '"CampusCoin Support" <noreply@campuscoin.app>',
            to,
            subject: 'Verify your CampusCoin Email',
            text: `Your email verification code is: ${otp}. It will expire in 10 minutes.`,
            html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e5e7eb; border-radius: 8px; overflow: hidden;">
          <div style="background-color: #7c3aed; padding: 20px; text-align: center;">
            <h1 style="color: #ffffff; margin: 0; font-size: 24px;">CampusCoin</h1>
          </div>
          <div style="padding: 30px; background-color: #ffffff;">
            <p style="font-size: 16px; color: #374151;">Hello,</p>
            <p style="font-size: 16px; color: #374151;">Use the following code to verify your email address. This will unlock your +50 CampusCoins milestone reward!</p>
            <div style="margin: 30px 0; text-align: center;">
              <span style="font-size: 32px; font-weight: bold; letter-spacing: 4px; color: #7c3aed; background-color: #f3f4f6; padding: 10px 20px; border-radius: 8px;">
                ${otp}
              </span>
            </div>
            <p style="font-size: 14px; color: #6b7280; text-align: center;">This code will expire in 10 minutes.</p>
          </div>
        </div>
      `,
        };
        const info = await t.sendMail(mailOptions);
        if (info.messageId && !process.env.SMTP_HOST) {
            console.log('--- Email Preview ---');
            console.log('Message sent: %s', info.messageId);
            console.log('Preview URL: %s', nodemailer_1.default.getTestMessageUrl(info));
            console.log('OTP inside:', otp);
            console.log('---------------------');
        }
        return info;
    }
    catch (error) {
        console.error('Email sending failed:', error);
        throw new Error('Failed to send verification email. Please try again later.');
    }
};
exports.sendVerificationEmail = sendVerificationEmail;
//# sourceMappingURL=email.service.js.map