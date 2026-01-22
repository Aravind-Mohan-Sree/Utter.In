export interface IMailOptions {
  to: string;
  subject: string;
  text?: string;
  html?: string;
}

export interface IMailService {
  send(options: IMailOptions): Promise<void>;
  sendOtp(name: string, email: string, otp: string): Promise<void>;
  sendVerificationUpdate(name: string, email: string): Promise<void>;
  sendWelcome(name: string, email: string): Promise<void>;
  generateOtp(): string;
  verifyOtp(entered: string, stored: string): boolean;
}
