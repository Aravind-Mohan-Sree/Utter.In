export interface IForgotPasswordUseCase {
  execute(email: string): Promise<void>;
}

export interface IForgotPasswordOtpVerifyUseCase {
  execute(email: string, otp: string): Promise<string>;
}

export interface IResetPasswordUseCase {
  execute(resetToken: string, password: string): Promise<void>;
}
