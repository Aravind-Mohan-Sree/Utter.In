import { IForgotPasswordUseCase } from '~use-case-interfaces/shared/IForgotPasswordUseCase';
import { errorMessage } from '~constants/errorMessage';
import { IPendingUserRepository } from '~repository-interfaces/IPendingUserRepository';
import { IUserRepository } from '~repository-interfaces/IUserRepository';
import { IRedisService } from '~service-interfaces/IRedisService';
import { PendingUser } from '~entities/PendingUser';
import {
  BadRequestError,
  ForbiddenError,
  NotFoundError,
} from '~errors/HttpError';

export class ForgotPasswordUseCase implements IForgotPasswordUseCase {
  constructor(
    private _userRepo: IUserRepository,
    private _pendingUserRepo: IPendingUserRepository,
    private _redisService: IRedisService,
  ) { }

  async execute(email: string): Promise<void> {
    const user = await this._userRepo.findOneByField({ email });

    if (!user) throw new NotFoundError(errorMessage.ACCOUNT_NOT_EXISTS);
    if (user.isBlocked) throw new ForbiddenError(errorMessage.BLOCKED);

    const remainingTtl = await this._redisService.getOtpTtl(email);
    const coolDownLimit = 120 - 60; // 120 is max TTL, 60 is cooldown
    if (remainingTtl > coolDownLimit) {
      throw new BadRequestError('Please wait 60 sec before resend');
    }

    let pendingUser = await this._pendingUserRepo.findOneByField({ email });

    if (pendingUser) {
      await this._pendingUserRepo.deleteOneByField({ email });
    }

    pendingUser = new PendingUser(email, user.name);

    await this._pendingUserRepo.create(pendingUser);
  }
}
