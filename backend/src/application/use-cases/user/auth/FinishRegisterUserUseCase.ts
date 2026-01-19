import { errorMessage } from '~constants/errorMessage';
import { FinishRegisterUserDTO } from '~dtos/FinishRegisterUserDTO';
import { User } from '~entities/User';
import { BadRequestError } from '~errors/HttpError';
import { UserMapper, UserResponseDTO } from '~mappers/UserMapper';
import { IPendingUserRepository } from '~repository-interfaces/IPendingUserRepository';
import { IUserRepository } from '~repository-interfaces/IUserRepository';
import { ITokenService } from '~service-interfaces/ITokenService';
import { IFinishRegisterUserUseCase } from '~use-case-interfaces/user/IUserUseCase';

export class FinishRegisterUserUseCase implements IFinishRegisterUserUseCase {
  constructor(
    private pendingUserRepo: IPendingUserRepository,
    private userRepo: IUserRepository,
    private tokenService: ITokenService,
  ) {}

  async execute(data: FinishRegisterUserDTO): Promise<{
    oldId: string;
    user: UserResponseDTO;
    accessToken: string;
    refreshToken: string;
  }> {
    const { email, knownLanguages } = data;
    const pendingUser = await this.pendingUserRepo.findOneByField({ email });

    if (!pendingUser) throw new BadRequestError(errorMessage.SESSION_EXPIRED);

    let user = new User(
      pendingUser.name!,
      pendingUser.email,
      knownLanguages,
      'I am a Philologist!',
      ' ',
      null,
      { lastActive: null, currentStreak: 0, highestStreak: 0 },
      'user',
      false,
    );

    user = await this.userRepo.create(user);

    const accessToken = this.tokenService.generateAuthToken({
      id: user.id,
      role: 'user',
    });
    const refreshToken = this.tokenService.generateRefreshToken({
      id: user.id,
      role: 'user',
    });

    return {
      oldId: pendingUser.id!,
      user: UserMapper.toResponse(user),
      accessToken,
      refreshToken,
    };
  }
}
