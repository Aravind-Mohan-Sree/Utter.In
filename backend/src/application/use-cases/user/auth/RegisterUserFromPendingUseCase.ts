import { IRegisterUserFromPendingUseCase } from '~application-interfaces/use-cases/IUserUseCase';
import { UserMapper } from '~application-mappers/UserMapper';
import { IPendingUserRepository } from '~domain-repositories/IPendingUserRepository';
import { IUserRepository } from '~domain-repositories/IUserRepository';
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
