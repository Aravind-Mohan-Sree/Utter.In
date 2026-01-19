import { IForgotPasswordUseCase } from '~use-case-interfaces/shared/IForgotPasswordUseCase';
import { errorMessage } from '~constants/errorMessage';
import { IPendingUserRepository } from '~repository-interfaces/IPendingUserRepository';
import { IUserRepository } from '~repository-interfaces/IUserRepository';
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
  ) {}

  async execute(email: string): Promise<string> {
    const user = await this.userRepo.findOneByField({ email });

    if (!user) throw new NotFoundError(errorMessage.ACCOUNT_NOT_EXISTS);
    if (user.isBlocked) throw new ForbiddenError(errorMessage.BLOCKED);

    let pendingUser = await this.pendingUserRepo.findOneByField({ email });

    if (pendingUser) {
      const now = new Date().getTime();
      const coolDownMs = 60 * 1000;
      const timeDifferenceMs = now - new Date(pendingUser.updatedAt!).getTime();

      if (timeDifferenceMs < coolDownMs)
        throw new BadRequestError('Please wait 60 sec before resend');

      await this.pendingUserRepo.deleteOneByField({ email });
    }

    pendingUser = new PendingUser(email, user.name);

    pendingUser = await this.pendingUserRepo.create(pendingUser);

    return pendingUser.id!;
  }
}
