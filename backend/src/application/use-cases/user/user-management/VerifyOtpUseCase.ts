import { IVerifyOtpUseCase } from '~use-case-interfaces/shared/IOtpUseCase';
import { errorMessage } from '~constants/errorMessage';
import { IPendingUserRepository } from '~repository-interfaces/IPendingUserRepository';
import { IOtpService } from '~service-interfaces/IOtpService';
import { BadRequestError, NotFoundError } from '~errors/HttpError';

export class VerifyOtpUseCase implements IVerifyOtpUseCase {
  constructor(
    private otpService: IOtpService,
    private pendingUserRepo: IPendingUserRepository,
  ) {}

  async execute(email: string, otp: string): Promise<boolean> {
    const user = await this.pendingUserRepo.findOneByField({ email });

    if (!user) throw new NotFoundError(errorMessage.OTP_EXPIRED);

    const verified = this.otpService.verifyOtp(otp, user?.otp);

    if (!verified) throw new BadRequestError('Invalid OTP');

    return verified;
  }
}
