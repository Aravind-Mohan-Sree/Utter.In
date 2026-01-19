import { UserMapper, UserResponseDTO } from '~mappers/UserMapper';
import { IUserRepository } from '~repository-interfaces/IUserRepository';
import { IGetDataUseCase } from '~use-case-interfaces/user/IUserUseCase';

export class GetDataUseCase implements IGetDataUseCase {
  constructor(private userRepo: IUserRepository) {}

  async execute(email: string): Promise<UserResponseDTO | null> {
    const user = await this.userRepo.findOneByField({ email });

    if (!user) return null;

    return UserMapper.toResponse(user);
  }
}
