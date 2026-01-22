import { IRegisterUserFromPendingUseCase } from '~use-case-interfaces/user/IUserUseCase';
import { UserMapper, UserResponseDTO } from '~mappers/UserMapper';
import { IPendingUserRepository } from '~repository-interfaces/IPendingUserRepository';
import { IUserRepository } from '~repository-interfaces/IUserRepository';
import { User } from '~entities/User';
import { InternalServerError, NotFoundError } from '~errors/HttpError';
import { errorMessage } from '~constants/errorMessage';
import { IMailService } from '~service-interfaces/IMailService';

export class RegisterUserFromPendingUseCase implements IRegisterUserFromPendingUseCase {
  constructor(
    private pendingUserRepo: IPendingUserRepository,
    private userRepo: IUserRepository,
    private mailService: IMailService,
  ) {}

  async execute(email: string): Promise<UserResponseDTO> {
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

    await this.mailService.sendWelcome(newUser.name, newUser.email);

    if (!newUser) throw new InternalServerError(errorMessage.SOMETHING_WRONG);

    return UserMapper.toResponse(newUser);
  }
}
