import { errorMessage } from '~constants/errorMessage';
import { ChangePasswordDTO } from '~dtos/ChangePasswordDTO';
import { User } from '~entities/User';
import { BadRequestError, NotFoundError } from '~errors/HttpError';
import { IUserRepository } from '~repository-interfaces/IUserRepository';
import { IHashService } from '~service-interfaces/IHashService';
import { IChangePasswordUseCase } from '~use-case-interfaces/user/IUserUseCase';

export class ChangePasswordUseCase implements IChangePasswordUseCase {
  constructor(
    private _userRepo: IUserRepository,
    private _hashService: IHashService,
  ) {}

  async execute(id: string, data: ChangePasswordDTO): Promise<void> {
    const user = await this._userRepo.findOneById(id);

    if (!user) throw new NotFoundError(errorMessage.ACCOUNT_NOT_EXISTS);

    const validPassword = await this._hashService.compare(
      data.currentPassword,
      user.password,
    );

    if (!validPassword) throw new BadRequestError(errorMessage.WRONG_PASSWORD);

    const partialUser: Partial<User> = {
      password: await this._hashService.hash(data.password),
    };

    await this._userRepo.updateOneById(id, partialUser);
  }
}
