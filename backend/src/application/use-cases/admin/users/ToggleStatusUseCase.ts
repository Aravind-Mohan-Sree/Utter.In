import { User } from '~entities/User';
import { IUserRepository } from '~repository-interfaces/IUserRepository';
import { IToggleStatusUseCase } from '~use-case-interfaces/admin/IUsersUseCase';

/**
 * Use case to toggle a user's blocked status.
 * Allows admins to block or unblock regular users.
 */
export class ToggleUserStatusUseCase implements IToggleStatusUseCase {
  constructor(private _userRepo: IUserRepository) {}

  /**
   * Toggles the 'isBlocked' status of a user.
   * @param id The user's ID.
   */
  async execute(id: string): Promise<void> {
    const user = await this._userRepo.findOneById(id);

    if (!user) return;

    // Inverse the current blocked status
    const partialUser: Partial<User> = {
      isBlocked: !user.isBlocked,
    };

    // Save changes to the repository
    await this._userRepo.updateOneById(id, partialUser);
  }
}
