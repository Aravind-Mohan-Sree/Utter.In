import { ISendOtpUseCase } from '~application-interfaces/use-cases/IOtpUseCase';
import { errorMessage } from '~constants/errorMessage';
import { IPendingUserRepository } from '~domain-repositories/IPendingUserRepository';
import { IOtpService } from '~domain-services/IOtpService';
import { PendingUser } from '~entities/PendingUser';
import {
  BadRequestError,
  InternalServerError,
  NotFoundError,
} from '~errors/HttpError';

export class SendOtpUseCase implements ISendOtpUseCase {
  constructor(
    private otpService: IOtpService,
    private pendingUserRepo: IPendingUserRepository,
  ) {}

  async execute(email: string): Promise<void> {
    let user = await this.pendingUserRepo.findOneByField({ email });

    if (!user) throw new NotFoundError(errorMessage.OTP_EXPIRED);

    let otp = '';

    if (user.otp) {
      const now = new Date().getTime();
      const coolDownMs = 60 * 1000;
      const timeDifferenceMs = now - new Date(user.updatedAt!).getTime();

      if (timeDifferenceMs < coolDownMs)
        throw new BadRequestError('Please wait 60 sec before resend');
    }

    otp = this.otpService.createOtp();

    const partialPendingUser: Partial<PendingUser> = {
      otp,
    };

    user = await this.pendingUserRepo.updateOneByField(
      { email },
      partialPendingUser,
    );

    if (!user) throw new InternalServerError('Something went wrong');

    await this.otpService.sendOtp(user.name!, email, otp);
  }
}
