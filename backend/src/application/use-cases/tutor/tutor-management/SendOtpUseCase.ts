import { ISendOtpUseCase } from '~use-case-interfaces/shared/IOtpUseCase';
import { errorMessage } from '~constants/errorMessage';
import { IPendingTutorRepository } from '~repository-interfaces/IPendingTutorRepository';
import { IMailService } from '~service-interfaces/IMailService';
import { IRedisService } from '~service-interfaces/IRedisService';
import {
  BadRequestError,
  InternalServerError,
  NotFoundError,
} from '~errors/HttpError';

export class SendOtpUseCase implements ISendOtpUseCase {
  constructor(
    private _mailService: IMailService,
    private _pendingTutorRepo: IPendingTutorRepository,
    private _redisService: IRedisService,
  ) { }

  async execute(email: string): Promise<void> {
    let tutor = await this._pendingTutorRepo.findOneByField({ email });

    if (!tutor) throw new NotFoundError(errorMessage.OTP_EXPIRED);

    let otp = '';

    const remainingTtl = await this._redisService.getOtpTtl(email);
    const coolDownLimit = 120 - 60; // Max TTL 120s, cool down is 60s
    if (remainingTtl > coolDownLimit) {
      throw new BadRequestError('Please wait 60 sec before resend');
    }

    otp = this._mailService.generateOtp();

    // Store in Redis with 120 seconds TTL
    await this._redisService.storeOtp(email, otp, 120);

    await this._mailService.sendOtp(tutor.name!, tutor.email, otp);
  }
}
