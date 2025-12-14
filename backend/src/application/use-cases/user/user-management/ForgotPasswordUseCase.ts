import { IForgotPasswordUseCase } from '~application-interfaces/user/IForgotPasswordUseCase';
import { errorMessage } from '~constants/errorMessage';
import { IPendingUserRepository } from '~domain-repositories/IPendingUserRepository';
import { IUserRepository } from '~domain-repositories/IUserRepository';
import { PendingUser } from '~entities/PendingUser';
import { BadRequestError, NotFoundError } from '~errors/HttpError';

export class ForgotPasswordUseCase implements IForgotPasswordUseCase {
  constructor(
    private userRepo: IUserRepository,
    private pendingUserRepo: IPendingUserRepository,
  ) {}

  async execute(email: string): Promise<void> {
    const user = await this.userRepo.findOneByField({ email });

    if (!user) throw new NotFoundError(errorMessage.ACCOUNT_NOT_EXISTS);

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

    await this.pendingUserRepo.create(pendingUser);
  }
}
