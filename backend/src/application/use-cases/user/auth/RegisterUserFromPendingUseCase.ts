import { IRegisterUserFromPendingUseCase } from '~use-case-interfaces/user/IUserUseCase';
import { UserMapper } from '~mappers/UserMapper';
import { IPendingUserRepository } from '~repository-interfaces/IPendingUserRepository';
import { IUserRepository } from '~repository-interfaces/IUserRepository';
import { User } from '~entities/User';
import { InternalServerError, NotFoundError } from '~errors/HttpError';

export class RegisterUserFromPendingUseCase implements IRegisterUserFromPendingUseCase {
  constructor(
    private pendingUserRepo: IPendingUserRepository,
    private userRepo: IUserRepository,
  ) {}

  async execute(email: string): Promise<Partial<User>> {
    const pendingUser = await this.pendingUserRepo.findOneByField({ email });

    if (!pendingUser) throw new NotFoundError('User not found');

    const user = new User(
      pendingUser.name!,
      pendingUser.email,
      pendingUser.knownLanguages!,
      'I am a Philologist!',
      pendingUser.password!,
      null,
      { lastActive: null, currentStreak: 0, highestStreak: 0 },
      'user',
      false,
    );

    const newUser = await this.userRepo.create(user);

    if (!newUser) throw new InternalServerError('Something went wrong');

    return UserMapper.toResponse(newUser);
  }
}
