import { IVerifyOtpUseCase } from '~use-case-interfaces/shared/IOtpUseCase';
import { errorMessage } from '~constants/errorMessage';
import { IPendingTutorRepository } from '~repository-interfaces/IPendingTutorRepository';
import { IMailService } from '~service-interfaces/IMailService';
import { BadRequestError, NotFoundError } from '~errors/HttpError';

export class VerifyOtpUseCase implements IVerifyOtpUseCase {
  constructor(
    private mailService: IMailService,
    private pendingTutorRepo: IPendingTutorRepository,
  ) {}

  async execute(email: string, otp: string): Promise<boolean> {
    const tutor = await this.pendingTutorRepo.findOneByField({ email });

    if (!tutor) throw new NotFoundError(errorMessage.OTP_EXPIRED);

    const verified = this.mailService.verifyOtp(otp, tutor?.otp as string);

    if (!verified) throw new BadRequestError('Invalid OTP');

    return verified;
  }
}
