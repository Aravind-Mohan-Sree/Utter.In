import { User } from '~entities/User';
import { IUserRepository } from '~repository-interfaces/IUserRepository';
import { IToggleStatusUseCase } from '~use-case-interfaces/admin/IUsersUseCase';

export class ToggleUserStatusUseCase implements IToggleStatusUseCase {
  constructor(private _userRepo: IUserRepository) {}

  async execute(id: string): Promise<void> {
    const user = await this._userRepo.findOneById(id);

    if (!user) return;

    const partialUser: Partial<User> = {
      isBlocked: !user.isBlocked,
    };

    await this._userRepo.updateOneById(id, partialUser);
  }
}
