import { IForgotPasswordOtpVerifyUseCase } from '~use-case-interfaces/shared/IForgotPasswordUseCase';
import { errorMessage } from '~constants/errorMessage';
import { IPendingUserRepository } from '~repository-interfaces/IPendingUserRepository';
import { IMailService } from '~service-interfaces/IMailService';
import { IRedisService } from '~service-interfaces/IRedisService';
import { BadRequestError, NotFoundError } from '~errors/HttpError';
import { ITokenService } from '~service-interfaces/ITokenService';

export class ForgotPasswordOtpVerifyUseCase implements IForgotPasswordOtpVerifyUseCase {
  constructor(
    private _pendingUserRepo: IPendingUserRepository,
    private _mailService: IMailService,
    private _tokenService: ITokenService,
    private _redisService: IRedisService,
  ) { }

  async execute(email: string, otp: string): Promise<string> {
    const user = await this._pendingUserRepo.findOneByField({ email });
    const storedOtp = await this._redisService.getOtp(email);

    if (!user || !storedOtp) throw new NotFoundError(errorMessage.OTP_EXPIRED);

    const verified = this._mailService.verifyOtp(otp, storedOtp);

    if (!verified) throw new BadRequestError('Invalid OTP');

    await this._redisService.deleteOtp(email);

    const resetToken = this._tokenService.generateResetToken({
      email: user.email,
    });

    return resetToken;
  }
}
