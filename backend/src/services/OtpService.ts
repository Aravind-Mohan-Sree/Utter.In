import { IOtpService } from '~domain-services/IOtpService';
import nodemailer from 'nodemailer';
import { getEmailTemplate } from '~constants/getEmailTemplate';

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
      host: 'smtp.gmail.com',
      port: 587, // or 465 for SSL
      secure: false, // true if using port 465
      auth: {
        user: this.appEmail,
        pass: this.appPass,
      },
    });

    await smtpTransport.sendMail({
      from: this.appEmail,
      to: email,
      subject: 'OTP from Utter.In',
      text: `Thank you for choosing Utter.In. Your OTP is ${otp}.`,
      html: getEmailTemplate(name, otp),
    });
  }

  verifyOtp(enteredOtp: string, storedOtp: string): boolean {
    return enteredOtp.trim() === storedOtp;
  }
}
