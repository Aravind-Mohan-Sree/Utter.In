import { IForgotPasswordUseCase } from '~use-case-interfaces/shared/IForgotPasswordUseCase';
import { errorMessage } from '~constants/errorMessage';
import { IPendingUserRepository } from '~repository-interfaces/IPendingUserRepository';
import { IUserRepository } from '~repository-interfaces/IUserRepository';
import { IOtpService } from '~service-interfaces/IOtpService';
import { PendingUser } from '~entities/PendingUser';
import {
  BadRequestError,
  ForbiddenError,
  NotFoundError,
} from '~errors/HttpError';

export class ForgotPasswordUseCase implements IForgotPasswordUseCase {
  constructor(
    private userRepo: IUserRepository,
    private pendingUserRepo: IPendingUserRepository,
    private otpService: IOtpService,
  ) { }

  async execute(email: string): Promise<void> {
    const user = await this.userRepo.findOneByField({ email });

    if (!user) throw new NotFoundError(errorMessage.ACCOUNT_NOT_EXISTS);
    if (user.isBlocked) throw new ForbiddenError(errorMessage.BLOCKED);

    const remainingTtl = await this.otpService.getOtpTtl(email);
    const coolDownLimit = 120 - 60; // 120 is max TTL, 60 is cooldown
    if (remainingTtl > coolDownLimit) {
      throw new BadRequestError('Please wait 60 sec before resend');
    }

    let pendingUser = await this.pendingUserRepo.findOneByField({ email });

    if (pendingUser) {
      await this.pendingUserRepo.deleteOneByField({ email });
    }

    pendingUser = new PendingUser(email, user.name);

    await this.pendingUserRepo.create(pendingUser);
  }
}
