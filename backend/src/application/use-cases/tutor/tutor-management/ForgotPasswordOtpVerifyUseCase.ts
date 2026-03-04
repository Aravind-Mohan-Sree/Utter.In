import { IForgotPasswordOtpVerifyUseCase } from '~use-case-interfaces/shared/IForgotPasswordUseCase';
import { errorMessage } from '~constants/errorMessage';
import { IPendingTutorRepository } from '~repository-interfaces/IPendingTutorRepository';
import { IMailService } from '~service-interfaces/IMailService';
import { IOtpService } from '~service-interfaces/IOtpService';
import { BadRequestError, NotFoundError } from '~errors/HttpError';
import { ITokenService } from '~service-interfaces/ITokenService';

export class ForgotPasswordOtpVerifyUseCase implements IForgotPasswordOtpVerifyUseCase {
  constructor(
    private pendingTutorRepo: IPendingTutorRepository,
    private mailService: IMailService,
    private tokenService: ITokenService,
    private otpService: IOtpService,
  ) { }

  async execute(email: string, otp: string): Promise<string> {
    const tutor = await this.pendingTutorRepo.findOneByField({ email });
    const storedOtp = await this.otpService.getOtp(email);

    if (!tutor || !storedOtp) throw new NotFoundError(errorMessage.OTP_EXPIRED);

    const verified = this.mailService.verifyOtp(otp, storedOtp);

    if (!verified) throw new BadRequestError('Invalid OTP');

    await this.otpService.deleteOtp(email);

    const resetToken = this.tokenService.generateResetToken({
      email: tutor.email,
    });

    return resetToken;
  }
}
