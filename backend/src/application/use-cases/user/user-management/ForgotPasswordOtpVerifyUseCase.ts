import { IForgotPasswordOtpVerifyUseCase } from '~application-interfaces/use-cases/IForgotPasswordUseCase';
import { errorMessage } from '~constants/errorMessage';
import { IPendingUserRepository } from '~domain-repositories/IPendingUserRepository';
import { IOtpService } from '~domain-services/IOtpService';
import { BadRequestError, NotFoundError } from '~errors/HttpError';
import { ITokenService } from '~domain-services/ITokenService';

export class ForgotPasswordOtpVerifyUseCase implements IForgotPasswordOtpVerifyUseCase {
  constructor(
    private pendingUserRepo: IPendingUserRepository,
    private otpService: IOtpService,
    private tokenService: ITokenService,
  ) {}

  async execute(email: string, otp: string): Promise<string> {
    const user = await this.pendingUserRepo.findOneByField({ email });

    if (!user) throw new NotFoundError(errorMessage.OTP_EXPIRED);

    const verified = this.otpService.verifyOtp(otp, user?.otp);

    if (!verified) throw new BadRequestError('Invalid OTP');

    const resetToken = this.tokenService.generateResetToken({
      email: user.email,
    });

    return resetToken;
  }
}
