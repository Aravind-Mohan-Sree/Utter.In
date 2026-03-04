import { IVerifyOtpUseCase } from '~use-case-interfaces/shared/IOtpUseCase';
import { errorMessage } from '~constants/errorMessage';
import { IMailService } from '~service-interfaces/IMailService';
import { IOtpService } from '~service-interfaces/IOtpService';
import { BadRequestError, NotFoundError } from '~errors/HttpError';

export class VerifyOtpUseCase implements IVerifyOtpUseCase {
  constructor(
    private mailService: IMailService,
    private otpService: IOtpService,
  ) { }

  async execute(email: string, otp: string): Promise<boolean> {
    const storedOtp = await this.otpService.getOtp(email);

    if (!storedOtp) throw new NotFoundError(errorMessage.OTP_EXPIRED);

    const verified = this.mailService.verifyOtp(otp, storedOtp);

    if (!verified) throw new BadRequestError('Invalid OTP');

    await this.otpService.deleteOtp(email);

    return verified;
  }
}
