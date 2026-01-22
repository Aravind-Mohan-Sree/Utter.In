import { IVerifyOtpUseCase } from '~use-case-interfaces/shared/IOtpUseCase';
import { errorMessage } from '~constants/errorMessage';
import { IPendingUserRepository } from '~repository-interfaces/IPendingUserRepository';
import { IMailService } from '~service-interfaces/IMailService';
import { BadRequestError, NotFoundError } from '~errors/HttpError';

export class VerifyOtpUseCase implements IVerifyOtpUseCase {
  constructor(
    private mailService: IMailService,
    private pendingUserRepo: IPendingUserRepository,
  ) {}

  async execute(email: string, otp: string): Promise<boolean> {
    const user = await this.pendingUserRepo.findOneByField({ email });

    if (!user) throw new NotFoundError(errorMessage.OTP_EXPIRED);

    const verified = this.mailService.verifyOtp(otp, user?.otp as string);

    if (!verified) throw new BadRequestError('Invalid OTP');

    return verified;
  }
}
