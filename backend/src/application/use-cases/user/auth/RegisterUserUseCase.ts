import { RegisterUserDTO } from '~dtos/RegisterUserDTO';
import { IRegisterUserUseCase } from '~use-case-interfaces/user/IUserUseCase';
import { errorMessage } from '~constants/errorMessage';
import { IPendingUserRepository } from '~repository-interfaces/IPendingUserRepository';
import { IUserRepository } from '~repository-interfaces/IUserRepository';
import { IHashService } from '~service-interfaces/IHashService';
import { PendingUser } from '~entities/PendingUser';
import { ConflictError, InternalServerError } from '~errors/HttpError';

export class RegisterUserUseCase implements IRegisterUserUseCase {
  constructor(
    private userRepo: IUserRepository,
    private pendingUserRepo: IPendingUserRepository,
    private hashService: IHashService,
  ) {}

  async execute(data: RegisterUserDTO): Promise<string> {
    const user = await this.userRepo.findOneByField({ email: data.email });

    if (user) throw new ConflictError(errorMessage.ACCOUNT_EXISTS);

    let pendingUser = await this.pendingUserRepo.findOneByField({
      email: data.email,
    });

    if (pendingUser) {
      await this.pendingUserRepo.deleteOneByField({ email: pendingUser.email });
    }

    const hashedPassword = await this.hashService.hash(data.password);

    pendingUser = new PendingUser(
      data.email,
      data.name,
      data.knownLanguages,
      hashedPassword,
    );

    pendingUser = await this.pendingUserRepo.create(pendingUser);

    if (!pendingUser) throw new InternalServerError(errorMessage.SOMETHING_WRONG);

    return pendingUser.email!;
  }
}
