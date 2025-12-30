import { errorMessage } from '~constants/errorMessage';
import { User } from '~entities/User';
import { NotFoundError } from '~errors/HttpError';
import { UserMapper } from '~mappers/UserMapper';
import { IUserRepository } from '~repository-interfaces/IUserRepository';
import { IGetDataUseCase } from '~use-case-interfaces/user/IUserUseCase';

export class GetDataUseCase implements IGetDataUseCase {
  constructor(private userRepo: IUserRepository) {}

  async execute(email: string): Promise<Partial<User>> {
    const user = await this.userRepo.findOneByField({ email });

    if (!user) throw new NotFoundError(errorMessage.SOMETHING_WRONG);

    return UserMapper.toResponse(user);
  }
}
