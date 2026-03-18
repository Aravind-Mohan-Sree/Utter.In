import { UserMapper, UserResponseDTO } from '~mappers/UserMapper';
import { IUserRepository } from '~repository-interfaces/IUserRepository';
import { IGetDataUseCase } from '~use-case-interfaces/user/IUserUseCase';

export class GetDataUseCase implements IGetDataUseCase {
  constructor(private _userRepo: IUserRepository) {}

  async execute(email: string): Promise<UserResponseDTO | null> {
    const user = await this._userRepo.findOneByField({ email });
    if (!user || user.isBlocked) return null;

    return UserMapper.toResponse(user);
  }
}
