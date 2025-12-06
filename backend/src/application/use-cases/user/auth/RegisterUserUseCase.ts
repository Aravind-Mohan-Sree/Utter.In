import { RegisterUserDTO } from '~/application/dtos/RegisterUserDTO';
import { IRegisterUserUseCase } from '~application-interfaces/use-cases/IUserUseCase';
import { IPendingUserRepository } from '~domain-repositories/IPendingUserRepository';
import { IUserRepository } from '~domain-repositories/IUserRepository';
import { IHashService } from '~domain-services/IHashService';
import { ConflictError, InternalServerError } from '~errors/HttpError';

export class RegisterUserUseCase implements IRegisterUserUseCase {
  constructor(
    private userRepo: IUserRepository,
    private pendingUserRepo: IPendingUserRepository,
    private hashService: IHashService,
  ) {}

  async execute(data: RegisterUserDTO): Promise<string> {
    const user = await this.userRepo.findByEmail(data.email);

    if (user) throw new ConflictError('Email already exists');

    const hashedPassword = await this.hashService.hash(data.password);

    const pendingUser = await this.pendingUserRepo.create({
      name: data.name,
      email: data.email,
      knownLanguages: data.knownLanguages,
      password: hashedPassword,
    });

    if (!pendingUser) throw new InternalServerError('Something went wrong');

    return pendingUser.email;
  }
}
