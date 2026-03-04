import { ISendOtpUseCase } from '~use-case-interfaces/shared/IOtpUseCase';
import { errorMessage } from '~constants/errorMessage';
import { IPendingTutorRepository } from '~repository-interfaces/IPendingTutorRepository';
import { IMailService } from '~service-interfaces/IMailService';
import { IOtpService } from '~service-interfaces/IOtpService';
import { PendingTutor } from '~entities/PendingTutor';
import {
  BadRequestError,
  InternalServerError,
  NotFoundError,
} from '~errors/HttpError';

export class SendOtpUseCase implements ISendOtpUseCase {
  constructor(
    private mailService: IMailService,
    private pendingTutorRepo: IPendingTutorRepository,
    private otpService: IOtpService,
  ) { }

  async execute(email: string): Promise<void> {
    let tutor = await this.pendingTutorRepo.findOneByField({ email });

    if (!tutor) throw new NotFoundError(errorMessage.OTP_EXPIRED);

    let otp = '';

    const remainingTtl = await this.otpService.getOtpTtl(email);
    const coolDownLimit = 120 - 60; // Max TTL 120s, cool down is 60s
    if (remainingTtl > coolDownLimit) {
      throw new BadRequestError('Please wait 60 sec before resend');
    }

    otp = this.mailService.generateOtp();

    // Store in Redis with 120 seconds TTL
    await this.otpService.storeOtp(email, otp, 120);

    await this.mailService.sendOtp(tutor.name!, tutor.email, otp);
  }
}
