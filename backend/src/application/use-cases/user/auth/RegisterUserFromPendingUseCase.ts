import { IRegisterUserFromPendingUseCase } from '~application-interfaces/use-cases/IUserUseCase';
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
    const pendingUser = await this.pendingUserRepo.findPendingUser(email);

    if (!pendingUser) throw new NotFoundError('User not found');

    const user = new User(
      pendingUser.name,
      pendingUser.email,
      pendingUser.knownLanguages,
      pendingUser.password,
      new Date(),
      new Date(),
      null,
      { lastActive: null, currentStreak: 0, highestStreak: 0 },
    );

    const newUser = await this.userRepo.create(user);

    if (!newUser) throw new InternalServerError('Something went wrong');

    return { name: newUser.name, email: newUser.email };
  }
}
