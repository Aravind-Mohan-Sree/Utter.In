import { SigninUserDTO } from '~/application/dtos/SigninUserDTO';
import { ISigninUserUseCase } from '~application-interfaces/use-cases/IUserUseCase';
import { UserMapper } from '~application-mappers/UserMapper';
import { errorMessage } from '~constants/errorMessage';
import { IUserRepository } from '~domain-repositories/IUserRepository';
import { IHashService } from '~domain-services/IHashService';
import { ITokenService } from '~domain-services/ITokenService';
import { User } from '~entities/User';
import { BadRequestError, NotFoundError } from '~errors/HttpError';

export class SigninUserUseCase implements ISigninUserUseCase {
  constructor(
    private userRepo: IUserRepository,
    private hashService: IHashService,
    private tokenService: ITokenService,
  ) {}

  async execute(data: SigninUserDTO): Promise<{
    user: Partial<User>;
    accessToken: string;
    refreshToken: string;
  }> {
    const { email, password } = data;
    const user = await this.userRepo.findOneByField({ email });

    if (!user) throw new NotFoundError(errorMessage.ACCOUNT_NOT_EXISTS);

    const valid = await this.hashService.compare(password, user.password!);

    if (!valid) throw new BadRequestError(errorMessage.WRONG_PASSWORD);

    const accessToken = this.tokenService.generateAuthToken({
      id: user.id,
      role: 'user',
    });
    const refreshToken = this.tokenService.generateRefreshToken({
      id: user.id,
      role: 'user',
    });

    return {
      user: UserMapper.toResponse(user),
      accessToken,
      refreshToken,
    };
  }
}
