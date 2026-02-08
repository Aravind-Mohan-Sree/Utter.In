import { PendingUser } from '~entities/PendingUser';
import { IPendingUserRepository } from '~repository-interfaces/IPendingUserRepository';
import { IUserGoogleRegisterUseCase } from '~use-case-interfaces/user/IUserUseCase';

export class UserGoogleRegisterUseCase implements IUserGoogleRegisterUseCase {
  constructor(private pendingUserRepo: IPendingUserRepository) {}

  async execute(
    name: string,
    email: string,
    googleId: string,
  ): Promise<string> {
    let pendingUser = await this.pendingUserRepo.findOneByField({ email });

    if (pendingUser) {
      await this.pendingUserRepo.deleteOneByField({ email: pendingUser.email });
    }

    const user: PendingUser = {
      name,
      email,
      googleId,
    };

    pendingUser = await this.pendingUserRepo.create(user);

    return pendingUser.id!;
  }
}
