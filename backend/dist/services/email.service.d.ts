import nodemailer from 'nodemailer';
export declare const initTransporter: () => Promise<nodemailer.Transporter<any, nodemailer.TransportOptions>>;
export declare const sendVerificationEmail: (to: string, otp: string) => Promise<any>;
//# sourceMappingURL=email.service.d.ts.map