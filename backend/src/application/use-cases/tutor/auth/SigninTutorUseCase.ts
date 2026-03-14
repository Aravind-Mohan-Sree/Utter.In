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
    private _tutorRepo: ITutorRepository,
    private _hashService: IHashService,
    private _tokenService: ITokenService,
  ) {}

  async execute(data: SigninDTO): Promise<{
    tutor: TutorResponseDTO;
    accessToken: string;
    refreshToken: string;
  }> {
    const { email, password } = data;
    const tutor = await this._tutorRepo.findOneByField({ email });

    if (!tutor) throw new NotFoundError(errorMessage.ACCOUNT_NOT_EXISTS);

    if (!tutor.isVerified && !tutor.rejectionReason)
      throw new ForbiddenError(errorMessage.UNVERIFIED);
    if (tutor.rejectionReason)
      throw new BadRequestError(
        `${errorMessage.REJECTED}-${tutor.rejectionReason}/${tutor.email}`,
      );
    if (tutor.isBlocked) throw new ForbiddenError(errorMessage.BLOCKED);

    const valid = await this._hashService.compare(password, tutor.password!);

    if (!valid) throw new BadRequestError(errorMessage.WRONG_PASSWORD);

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
