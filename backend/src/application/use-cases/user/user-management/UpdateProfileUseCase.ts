import { errorMessage } from '~constants/errorMessage';
import { UserProfileUpdateDTO } from '~dtos/UserProfileUpdateDTO';
import { User } from '~entities/User';
import { NotFoundError } from '~errors/HttpError';
import { UserMapper, UserResponseDTO } from '~mappers/UserMapper';
import { IUserRepository } from '~repository-interfaces/IUserRepository';
import { IUpdateProfileUseCase } from '~use-case-interfaces/user/IUserUseCase';

/**
 * Use case to handle profile updates for regular users.
 */
export class UpdateProfileUseCase implements IUpdateProfileUseCase {
  constructor(private _userRepo: IUserRepository) {}

  /**
   * Updates basic user profile information.
   * @param id The user's unique ID.
   * @param data DTO containing updated name, bio, and languages.
   * @returns Mapped user response DTO.
   */
  async execute(
    id: string,
    data: UserProfileUpdateDTO,
  ): Promise<UserResponseDTO> {
    const partialUser: Partial<User> = {
      name: data.name,
      bio: data.bio,
      knownLanguages: data.knownLanguages,
    };
    
    // Persist changes to the user repository
    const updatedUser = await this._userRepo.updateOneById(id, partialUser);

    if (!updatedUser) throw new NotFoundError(errorMessage.ACCOUNT_NOT_EXISTS);

    return UserMapper.toResponse(updatedUser);
  }
}
