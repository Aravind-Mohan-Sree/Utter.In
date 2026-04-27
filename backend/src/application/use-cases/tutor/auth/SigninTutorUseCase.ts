import { SigninDTO } from '~dtos/SigninDTO';
import { ISigninTutorUseCase } from '~use-case-interfaces/tutor/ITutorUseCase';
import { TutorMapper, TutorResponseDTO } from '~mappers/TutorMapper';
import { errorMessage } from '~constants/errorMessage';
import { ITutorRepository } from '~repository-interfaces/ITutorRepository';
import { IHashService } from '~service-interfaces/IHashService';
import { ITokenService } from '~service-interfaces/ITokenService';
import {
  BadRequestError,
  ForbiddenError,
  NotFoundError,
} from '~errors/HttpError';

/**
 * Use case to handle tutor authentication.
 * Validates credentials and checks account status (verification, block status, rejection).
 */
export class SigninTutorUseCase implements ISigninTutorUseCase {
  constructor(
    private _tutorRepo: ITutorRepository,
    private _hashService: IHashService,
    private _tokenService: ITokenService,
  ) {}

  /**
   * Authenticates a tutor and generates session tokens.
   * @param data DTO containing email and password.
   * @returns Mapped tutor data and JWT tokens.
   */
  async execute(data: SigninDTO): Promise<{
    tutor: TutorResponseDTO;
    accessToken: string;
    refreshToken: string;
  }> {
    const { email, password } = data;
    
    // Check if tutor exists
    const tutor = await this._tutorRepo.findOneByField({ email });

    if (!tutor) throw new NotFoundError(errorMessage.ACCOUNT_NOT_EXISTS);

    // Business rule: unverified tutors cannot login unless they have a rejection reason (to see why)
    if (!tutor.isVerified && !tutor.rejectionReason)
      throw new ForbiddenError(errorMessage.UNVERIFIED);
    
    // If account was rejected, block login and provide the reason
    if (tutor.rejectionReason)
      throw new BadRequestError(
        `${errorMessage.REJECTED}-${tutor.rejectionReason}/${tutor.email}`,
      );
      
    // Blocked tutors cannot access the platform
    if (tutor.isBlocked) throw new ForbiddenError(errorMessage.BLOCKED);

    // Verify password
    const valid = await this._hashService.compare(password, tutor.password!);

    if (!valid) throw new BadRequestError(errorMessage.WRONG_PASSWORD);

    // Generate JWTs for session management
    const accessToken = this._tokenService.generateAuthToken({
      id: tutor.id,
      role: 'tutor',
    });
    const refreshToken = this._tokenService.generateRefreshToken({
      id: tutor.id,
      role: 'tutor',
    });

    return {
      tutor: TutorMapper.toResponse(tutor),
      accessToken,
      refreshToken,
    };
  }
}
