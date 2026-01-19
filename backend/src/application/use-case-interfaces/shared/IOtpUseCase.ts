export interface ISendOtpUseCase {
  execute(id: string): Promise<void>;
}

export interface IVerifyOtpUseCase {
  execute(email: string, otp: string): Promise<boolean>;
}
