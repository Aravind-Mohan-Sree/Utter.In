import { IGoogleAuthUseCase } from '~application-interfaces/user/IUserUseCase';
import { UserMapper } from '~application-mappers/UserMapper';
import { errorMessage } from '~constants/errorMessage';
import { IUserRepository } from '~domain-repositories/IUserRepository';
import { ITokenService } from '~domain-services/ITokenService';
import { User } from '~entities/User';
import { BadRequestError, NotFoundError } from '~errors/HttpError';

export class GoogleAuthUseCase implements IGoogleAuthUseCase {
  constructor(
    private userRepo: IUserRepository,
    private tokenService: ITokenService,
  ) {}

  async execute(
    email: string,
    googleId: string,
  ): Promise<{
    user: Partial<User>;
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
      throw new BadRequestError(errorMessage.BLOCKED);
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
