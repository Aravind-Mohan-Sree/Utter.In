import { IUserGoogleAuthUseCase } from '~use-case-interfaces/user/IUserUseCase';
import { UserMapper, UserResponseDTO } from '~mappers/UserMapper';
import { errorMessage } from '~constants/errorMessage';
import { IUserRepository } from '~repository-interfaces/IUserRepository';
import { ITokenService } from '~service-interfaces/ITokenService';
import { User } from '~entities/User';
import { ForbiddenError, NotFoundError } from '~errors/HttpError';

export class UserGoogleAuthUseCase implements IUserGoogleAuthUseCase {
  constructor(
    private userRepo: IUserRepository,
    private tokenService: ITokenService,
  ) {}

  async execute(
    email: string,
    googleId: string,
  ): Promise<{
    user: UserResponseDTO;
    accessToken: string;
    refreshToken: string;
  }> {
    let user = await this.userRepo.findOneByField({ googleId });

    if (!user) {
      user = await this.userRepo.findOneByField({ email });

      if (user) {
        const partialUser: Partial<User> = {
          googleId,
        };

        user = await this.userRepo.updateOneById(user.id!, partialUser);
      } else {
        throw new NotFoundError(errorMessage.ACCOUNT_NOT_EXISTS);
      }
    }

    if (user?.isBlocked) {
      throw new ForbiddenError(errorMessage.BLOCKED);
    }

    const accessToken = this.tokenService.generateAuthToken({
      id: user?.id,
      role: 'user',
    });

    const refreshToken = this.tokenService.generateRefreshToken({
      id: user?.id,
      role: 'user',
    });

    return {
      user: UserMapper.toResponse(user!),
      accessToken,
      refreshToken,
    };
  }
}
