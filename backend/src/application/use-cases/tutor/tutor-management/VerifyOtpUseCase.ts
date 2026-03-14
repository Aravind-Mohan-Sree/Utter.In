import { IVerifyOtpUseCase } from '~use-case-interfaces/shared/IOtpUseCase';
import { errorMessage } from '~constants/errorMessage';
import { IMailService } from '~service-interfaces/IMailService';
import { IRedisService } from '~service-interfaces/IRedisService';
import { BadRequestError, NotFoundError } from '~errors/HttpError';

export class VerifyOtpUseCase implements IVerifyOtpUseCase {
  constructor(
    private _mailService: IMailService,
    private _redisService: IRedisService,
  ) { }

  async execute(email: string, otp: string): Promise<boolean> {
    const storedOtp = await this._redisService.getOtp(email);

    if (!storedOtp) throw new NotFoundError(errorMessage.OTP_EXPIRED);

    const verified = this._mailService.verifyOtp(otp, storedOtp);

    if (!verified) throw new BadRequestError('Invalid OTP');

    await this._redisService.deleteOtp(email);

    return verified;
  }
}
