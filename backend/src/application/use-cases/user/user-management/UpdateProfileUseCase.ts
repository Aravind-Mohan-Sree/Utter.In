import { errorMessage } from '~constants/errorMessage';
import { UserProfileUpdateDTO } from '~dtos/UserProfileUpdateDTO';
import { User } from '~entities/User';
import { NotFoundError } from '~errors/HttpError';
import { UserMapper, UserResponseDTO } from '~mappers/UserMapper';
import { IUserRepository } from '~repository-interfaces/IUserRepository';
import { IUpdateProfileUseCase } from '~use-case-interfaces/user/IUserUseCase';

export class UpdateProfileUseCase implements IUpdateProfileUseCase {
  constructor(private userRepo: IUserRepository) {}

  async execute(
    id: string,
    data: UserProfileUpdateDTO,
  ): Promise<UserResponseDTO> {
    const partialUser: Partial<User> = {
      name: data.name,
      bio: data.bio,
      knownLanguages: data.knownLanguages,
    };
    const updatedUser = await this.userRepo.updateOneById(id, partialUser);

    if (!updatedUser) throw new NotFoundError(errorMessage.ACCOUNT_NOT_EXISTS);

    return UserMapper.toResponse(updatedUser);
  }
}
