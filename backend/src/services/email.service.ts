import nodemailer from 'nodemailer';

let transporter: nodemailer.Transporter | null = null;

export const initTransporter = async () => {
  if (transporter) return transporter;

  // Use real SMTP if provided in ENV
  if (process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS) {
    transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT) || 587,
      secure: process.env.SMTP_SECURE === 'true', // true for 465, false for other ports
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
  } else {
    // Fallback to Ethereal Email for local development
    console.log('No SMTP credentials found. Falling back to Ethereal Email (mock).');
    try {
      const testAccount = await nodemailer.createTestAccount();
      transporter = nodemailer.createTransport({
        host: 'smtp.ethereal.email',
        port: 587,
        secure: false,
        auth: {
          user: testAccount.user,
          pass: testAccount.pass,
        },
      });
    } catch (err) {
      console.error('Failed to create Ethereal test account:', err);
      throw new Error('Email service initialization failed.');
    }
  }

  return transporter;
};

export const sendVerificationEmail = async (to: string, otp: string) => {
  try {
    const t = await initTransporter();

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
    
    // For local dev with Ethereal, print the link to view the email
    if (info.messageId && !process.env.SMTP_HOST) {
      console.log('--- Email Preview ---');
      console.log('Message sent: %s', info.messageId);
      console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info));
      console.log('OTP inside:', otp);
      console.log('---------------------');
    }

    return info;
  } catch (error) {
    console.error('Email sending failed:', error);
    throw new Error('Failed to send verification email. Please try again later.');
  }
};
