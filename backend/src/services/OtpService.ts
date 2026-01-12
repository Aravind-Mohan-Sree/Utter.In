import { IOtpService } from '~service-interfaces/IOtpService';
import nodemailer from 'nodemailer';
import { env } from '~config/env';
import { otpEmailTemplate } from '~constants/otpEmailTemplate';

export class OtpService implements IOtpService {
  constructor(
    private appEmail: string,
    private appPass: string,
  ) {}

  createOtp(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  async sendOtp(name: string, email: string, otp: string): Promise<void> {
    const smtpTransport = nodemailer.createTransport({
      host: env.NODEMAILER_HOST,
      port: parseInt(env.NODEMAILER_PORT), // or 465 for SSL
      secure: false, // true if using port 465
      auth: {
        user: this.appEmail,
        pass: this.appPass,
      },
    });

    await smtpTransport.sendMail({
      from: this.appEmail,
      to: email,
      subject: 'OTP from Utter',
      text: `Thank you for choosing Utter. Your OTP is ${otp}.`,
      html: otpEmailTemplate(name, otp),
    });
  }

  verifyOtp(enteredOtp: string, storedOtp: string): boolean {
    return enteredOtp.trim() === storedOtp;
  }
}
