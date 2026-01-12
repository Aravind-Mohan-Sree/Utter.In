import { SigninDTO } from '~dtos/SigninDTO';
import { ISigninUserUseCase } from '~use-case-interfaces/user/IUserUseCase';
import { UserMapper, UserResponseDTO } from '~mappers/UserMapper';
import { errorMessage } from '~constants/errorMessage';
import { IUserRepository } from '~repository-interfaces/IUserRepository';
import { IHashService } from '~service-interfaces/IHashService';
import { ITokenService } from '~service-interfaces/ITokenService';
import { BadRequestError, ForbiddenError, NotFoundError } from '~errors/HttpError';

export class SigninUserUseCase implements ISigninUserUseCase {
  constructor(
    private userRepo: IUserRepository,
    private hashService: IHashService,
    private tokenService: ITokenService,
  ) {}

  async execute(data: SigninDTO): Promise<{
    user: UserResponseDTO;
    accessToken: string;
    refreshToken: string;
  }> {
    const { email, password } = data;
    const user = await this.userRepo.findOneByField({ email });

    if (!user) throw new NotFoundError(errorMessage.ACCOUNT_NOT_EXISTS);

    if (user.isBlocked) throw new ForbiddenError(errorMessage.BLOCKED);

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
