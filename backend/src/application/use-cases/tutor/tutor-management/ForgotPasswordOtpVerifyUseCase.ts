import { IForgotPasswordOtpVerifyUseCase } from '~use-case-interfaces/shared/IForgotPasswordUseCase';
import { errorMessage } from '~constants/errorMessage';
import { IPendingTutorRepository } from '~repository-interfaces/IPendingTutorRepository';
import { IMailService } from '~service-interfaces/IMailService';
import { BadRequestError, NotFoundError } from '~errors/HttpError';
import { ITokenService } from '~service-interfaces/ITokenService';

export class ForgotPasswordOtpVerifyUseCase implements IForgotPasswordOtpVerifyUseCase {
  constructor(
    private pendingTutorRepo: IPendingTutorRepository,
    private mailService: IMailService,
    private tokenService: ITokenService,
  ) {}

  async execute(email: string, otp: string): Promise<string> {
    const tutor = await this.pendingTutorRepo.findOneByField({ email });

    if (!tutor) throw new NotFoundError(errorMessage.OTP_EXPIRED);

    const verified = this.mailService.verifyOtp(otp, tutor?.otp as string);

    if (!verified) throw new BadRequestError('Invalid OTP');

    const resetToken = this.tokenService.generateResetToken({
      email: tutor.email,
    });

    return resetToken;
  }
}
