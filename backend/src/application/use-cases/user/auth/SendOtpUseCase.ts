import { ISendOtpUseCase } from '~application-interfaces/use-cases/IOtpUseCase';
import { IPendingUserRepository } from '~domain-repositories/IPendingUserRepository';
import { IOtpService } from '~domain-services/IOtpService';
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
    const user = await this.pendingUserRepo.findPendingUser(email);

    if (!user) throw new NotFoundError('Session expired. Signup again');

    let otp = '';

    if (user.otp) {
      const now = new Date().getTime();
      const coolDownMs = 60 * 1000;
      const timeDifferenceMs = now - (user.updatedAt?.getTime() ?? now);

      if (timeDifferenceMs < coolDownMs)
        throw new BadRequestError('Please wait 60 sec before resend');
    }

    otp = this.otpService.createOtp();

    const updated = await this.pendingUserRepo.updateOtp(email, otp);

    if (!updated) throw new InternalServerError('Something went wrong');

    await this.otpService.sendOtp(user.name, email, otp);
  }
}
