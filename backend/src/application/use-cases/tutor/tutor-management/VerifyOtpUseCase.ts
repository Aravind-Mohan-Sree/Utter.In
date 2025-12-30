import { IVerifyOtpUseCase } from '~use-case-interfaces/shared/IOtpUseCase';
import { errorMessage } from '~constants/errorMessage';
import { IPendingTutorRepository } from '~repository-interfaces/IPendingTutorRepository';
import { IOtpService } from '~service-interfaces/IOtpService';
import { BadRequestError, NotFoundError } from '~errors/HttpError';

export class VerifyOtpUseCase implements IVerifyOtpUseCase {
  constructor(
    private otpService: IOtpService,
    private pendingTutorRepo: IPendingTutorRepository,
  ) {}

  async execute(email: string, otp: string): Promise<boolean> {
    const tutor = await this.pendingTutorRepo.findOneByField({ email });

    if (!tutor) throw new NotFoundError(errorMessage.OTP_EXPIRED);

    const verified = this.otpService.verifyOtp(otp, tutor?.otp);

    if (!verified) throw new BadRequestError('Invalid OTP');

    return verified;
  }
}
