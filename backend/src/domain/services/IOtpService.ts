export interface IOtpService {
  createOtp(): string;
  sendOtp(name: string, email: string, otp: string): Promise<void>;
  verifyOtp(enteredOtp: string, storedOtp: string | undefined): boolean;
}
