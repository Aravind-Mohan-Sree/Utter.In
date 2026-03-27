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
  private _transporter = nodemailer.createTransport({
    host: env.NODEMAILER_HOST,
    port: parseInt(env.NODEMAILER_PORT),
    secure: env.NODEMAILER_PORT === '465',
    auth: {
      user: env.NODEMAILER_USER,
      pass: env.NODEMAILER_PASS,
    },
  });

  async send(options: IMailOptions): Promise<void> {
    await this._transporter.sendMail({
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

  async sendBookingConfirmation(name: string, email: string, sessionTopic: string, language: string, sessionDate: string, isTutor: boolean): Promise<void> {
    const roleText = isTutor ? 'You have a new booking' : 'Your session has been booked';
    const body = `${roleText}.<br><br><b>Topic:</b> ${sessionTopic}<br><b>Language:</b> ${language}<br><b>Date:</b> ${sessionDate}`;

    await this.send({
      to: email,
      subject: `Booking Confirmation: ${sessionTopic}`,
      html: emailTemplate(name, body),
    });
  }

  async sendBookingCancellation(name: string, email: string, sessionTopic: string, language: string, sessionDate: string, amount?: number): Promise<void> {
    let body = `The session "<b>${sessionTopic}</b>" (${language}) scheduled for ${sessionDate} has been cancelled.`;

    if (amount) {
      body += `<br><br>The amount of <b>₹${amount}</b> has been credited back to your wallet.`;
    }

    await this.send({
      to: email,
      subject: `Session Cancelled: ${sessionTopic}`,
      html: emailTemplate(name, body),
    });
  }

  async sendReportUpdate(name: string, email: string, status: 'Resolved' | 'Rejected', reason?: string): Promise<void> {
    const subject = status === 'Resolved' ? 'Action Taken on Account' : 'Status Update on Reported Interaction';
    const body = status === 'Resolved' 
      ? `We have reviewed a report regarding your recent interaction and have decided to <b>Restrict Your Account</b> due to a violation of our community standards.`
      : `We have reviewed the report regarding your recent interaction and have decided <b>Not to Take Any Action</b> at this time.${reason ? `<br><br><b>Administrative Note:</b> ${reason}` : ''}`;

    await this.send({
      to: email,
      subject,
      html: emailTemplate(name, body),
    });
  }

  generateOtp(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  verifyOtp(entered: string, stored: string): boolean {
    return entered.trim() === stored;
  }
}
