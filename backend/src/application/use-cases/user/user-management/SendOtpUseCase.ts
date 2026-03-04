import { ISendOtpUseCase } from '~use-case-interfaces/shared/IOtpUseCase';
import { errorMessage } from '~constants/errorMessage';
import { IPendingUserRepository } from '~repository-interfaces/IPendingUserRepository';
import { IMailService } from '~service-interfaces/IMailService';
import { IOtpService } from '~service-interfaces/IOtpService';
import { PendingUser } from '~entities/PendingUser';
import {
  BadRequestError,
  InternalServerError,
  NotFoundError,
} from '~errors/HttpError';

export class SendOtpUseCase implements ISendOtpUseCase {
  constructor(
    private mailService: IMailService,
    private pendingUserRepo: IPendingUserRepository,
    private otpService: IOtpService,
  ) { }

  async execute(email: string): Promise<void> {
    let user = await this.pendingUserRepo.findOneByField({ email });

    if (!user) throw new NotFoundError(errorMessage.OTP_EXPIRED);

    let otp = '';

    const remainingTtl = await this.otpService.getOtpTtl(email);
    const coolDownLimit = 120 - 60; // Assumed max TTL is 120s, cool down is 60s
    if (remainingTtl > coolDownLimit) {
      throw new BadRequestError('Please wait 60 sec before resend');
    }

    otp = this.mailService.generateOtp();

    // Store in Redis with 120 seconds TTL
    await this.otpService.storeOtp(email, otp, 120);

    await this.mailService.sendOtp(user.name!, user.email, otp);
  }
}
