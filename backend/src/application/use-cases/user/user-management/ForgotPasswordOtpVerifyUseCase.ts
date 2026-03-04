import { IForgotPasswordOtpVerifyUseCase } from '~use-case-interfaces/shared/IForgotPasswordUseCase';
import { errorMessage } from '~constants/errorMessage';
import { IPendingUserRepository } from '~repository-interfaces/IPendingUserRepository';
import { IMailService } from '~service-interfaces/IMailService';
import { IOtpService } from '~service-interfaces/IOtpService';
import { BadRequestError, NotFoundError } from '~errors/HttpError';
import { ITokenService } from '~service-interfaces/ITokenService';

export class ForgotPasswordOtpVerifyUseCase implements IForgotPasswordOtpVerifyUseCase {
  constructor(
    private pendingUserRepo: IPendingUserRepository,
    private mailService: IMailService,
    private tokenService: ITokenService,
    private otpService: IOtpService,
  ) { }

  async execute(email: string, otp: string): Promise<string> {
    const user = await this.pendingUserRepo.findOneByField({ email });
    const storedOtp = await this.otpService.getOtp(email);

    if (!user || !storedOtp) throw new NotFoundError(errorMessage.OTP_EXPIRED);

    const verified = this.mailService.verifyOtp(otp, storedOtp);

    if (!verified) throw new BadRequestError('Invalid OTP');

    await this.otpService.deleteOtp(email);

    const resetToken = this.tokenService.generateResetToken({
      email: user.email,
    });

    return resetToken;
  }
}
