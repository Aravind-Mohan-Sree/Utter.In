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

export class SigninTutorUseCase implements ISigninTutorUseCase {
  constructor(
    private tutorRepo: ITutorRepository,
    private hashService: IHashService,
    private tokenService: ITokenService,
  ) {}

  async execute(data: SigninDTO): Promise<{
    tutor: TutorResponseDTO;
    accessToken: string;
    refreshToken: string;
  }> {
    const { email, password } = data;
    const tutor = await this.tutorRepo.findOneByField({ email });

    if (!tutor) throw new NotFoundError(errorMessage.ACCOUNT_NOT_EXISTS);

    if (!tutor.isVerified && !tutor.rejectionReason)
      throw new ForbiddenError(errorMessage.UNVERIFIED);
    if (tutor.rejectionReason)
      throw new BadRequestError(
        `${errorMessage.REJECTED}-${tutor.rejectionReason}`,
      );
    if (tutor.isBlocked) throw new ForbiddenError(errorMessage.BLOCKED);

    const valid = await this.hashService.compare(password, tutor.password!);

    if (!valid) throw new BadRequestError(errorMessage.WRONG_PASSWORD);

    const accessToken = this.tokenService.generateAuthToken({
      id: tutor.id,
      role: 'tutor',
    });
    const refreshToken = this.tokenService.generateRefreshToken({
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
