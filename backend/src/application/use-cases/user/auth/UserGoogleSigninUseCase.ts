import { IUserGoogleSigninUseCase } from '~use-case-interfaces/user/IUserUseCase';
import { UserMapper, UserResponseDTO } from '~mappers/UserMapper';
import { errorMessage } from '~constants/errorMessage';
import { IUserRepository } from '~repository-interfaces/IUserRepository';
import { ITokenService } from '~service-interfaces/ITokenService';
import { User } from '~entities/User';
import { ForbiddenError, NotFoundError } from '~errors/HttpError';

/**
 * Use case to handle user authentication via Google.
 * Links Google IDs to existing accounts or validates existing Google-linked accounts.
 */
export class UserGoogleSigninUseCase implements IUserGoogleSigninUseCase {
  constructor(
    private userRepo: IUserRepository,
    private tokenService: ITokenService,
  ) {}

  /**
   * Authenticates a user using their Google identity.
   * @param email The user's Google email.
   * @param googleId The unique Google ID.
   * @returns Mapped user data and JWT tokens.
   */
  async execute(
    email: string,
    googleId: string,
  ): Promise<{
    user: UserResponseDTO;
    accessToken: string;
    refreshToken: string;
  }> {
    // Attempt to find the user by their Google ID first
    let user = await this.userRepo.findOneByField({ googleId });

    if (!user) {
      // If not found by Google ID, check if an account exists with the same email
      user = await this.userRepo.findOneByField({ email });

      if (user) {
        // If email matches, link the Google ID to the existing account for future logins
        const partialUser: Partial<User> = {
          googleId,
        };

        user = await this.userRepo.updateOneById(user.id!, partialUser);
      } else {
        // No account found at all
        throw new NotFoundError(errorMessage.ACCOUNT_NOT_EXISTS);
      }
    }

    // Security check: Blocked users cannot sign in
    if (user?.isBlocked) {
      throw new ForbiddenError(errorMessage.BLOCKED);
    }

    // Generate session tokens
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
