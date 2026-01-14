import { User } from '~entities/User';
import { IUserRepository } from '~repository-interfaces/IUserRepository';
import { IToggleStatusUseCase } from '~use-case-interfaces/admin/IUsersUseCase';

export class ToggleUserStatusUseCase implements IToggleStatusUseCase {
  constructor(private userRepo: IUserRepository) {}

  async execute(id: string): Promise<void> {
    const user = await this.userRepo.findOneById(id);

    if (!user) return;

    const partialUser: Partial<User> = {
      isBlocked: !user.isBlocked,
    };

    await this.userRepo.updateOneById(id, partialUser);
  }
}
