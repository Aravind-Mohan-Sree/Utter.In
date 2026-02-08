import nodemailer from 'nodemailer';
import { env } from '~config/env';
import { emailTemplate } from '~constants/emailTemplate';
import { IMailService } from '~service-interfaces/IMailService';

export interface IMailOptions {
  to: string;
  subject: string;
  text?: string;
  html?: string;
}

export class MailService implements IMailService {
  private transporter = nodemailer.createTransport({
    host: env.NODEMAILER_HOST,
    port: parseInt(env.NODEMAILER_PORT),
    secure: env.NODEMAILER_PORT === '465',
    auth: {
      user: env.NODEMAILER_USER,
      pass: env.NODEMAILER_PASS,
    },
  });

  async send(options: IMailOptions): Promise<void> {
    await this.transporter.sendMail({
      from: env.NODEMAILER_USER,
      ...options,
    });
  }

  async sendOtp(name: string, email: string, otp: string): Promise<void> {
    await this.send({
      to: email,
      subject: 'Your OTP Code',
      text: `Your OTP is ${otp}`,
      html: emailTemplate(
        name,
        'Please verify your email with the OTP given below.',
        otp,
      ),
    });
  }

  async sendVerificationUpdate(name: string, email: string): Promise<void> {
    const websiteLink = 'http://localhost:3000';

    await this.send({
      to: email,
      subject: 'Verification Process Completed',
      text: `Please sign in to know more`,
      html: emailTemplate(
        name,
        `The verification process is now complete. Please <a href="${websiteLink}" style="font-weight: bold;">sign in</a> to know more.`,
      ),
    });
  }

  async sendWelcome(name: string, email: string): Promise<void> {
    await this.send({
      to: email,
      subject: 'Welcome to Utter!',
      text: `Hi ${name}, welcome aboard!`,
      html: emailTemplate(
        name,
        `Welcome to Utter. We're glad to have you with us. Your account is now active and ready to use.`,
      ),
    });
  }

  generateOtp(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  verifyOtp(entered: string, stored: string): boolean {
    return entered.trim() === stored;
  }
}
