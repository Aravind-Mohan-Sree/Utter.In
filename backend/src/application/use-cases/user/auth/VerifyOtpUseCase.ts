import { IVerifyOtpUseCase } from '~application-interfaces/use-cases/IOtpUseCase';
import { IPendingUserRepository } from '~domain-repositories/IPendingUserRepository';
import { IOtpService } from '~domain-services/IOtpService';
import { BadRequestError } from '~errors/HttpError';

export class VerifyOtpUseCase implements IVerifyOtpUseCase {
  constructor(
    private otpService: IOtpService,
    private pendingUserRepo: IPendingUserRepository,
  ) {}

  async execute(email: string, otp: string): Promise<boolean> {
    const user = await this.pendingUserRepo.findPendingUser(email);
    const verified = this.otpService.verifyOtp(otp, user?.otp);

    if (!verified) throw new BadRequestError('Invalid OTP');

    return verified;
  }
}
