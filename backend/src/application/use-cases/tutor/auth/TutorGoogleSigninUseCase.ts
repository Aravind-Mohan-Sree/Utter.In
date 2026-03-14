import { ITutorGoogleSigninUseCase } from '~use-case-interfaces/tutor/ITutorUseCase';
import { TutorMapper, TutorResponseDTO } from '~mappers/TutorMapper';
import { errorMessage } from '~constants/errorMessage';
import { ITutorRepository } from '~repository-interfaces/ITutorRepository';
import { ITokenService } from '~service-interfaces/ITokenService';
import { Tutor } from '~entities/Tutor';
import {
  BadRequestError,
  ForbiddenError,
  NotFoundError,
} from '~errors/HttpError';

export class TutorGoogleSigninUseCase implements ITutorGoogleSigninUseCase {
  constructor(
    private _tutorRepo: ITutorRepository,
    private _tokenService: ITokenService,
  ) {}

  async execute(
    email: string,
    googleId: string,
  ): Promise<{
    tutor: TutorResponseDTO;
    accessToken: string;
    refreshToken: string;
  }> {
    let tutor = await this._tutorRepo.findOneByField({ googleId });

    if (!tutor) {
      tutor = await this._tutorRepo.findOneByField({ email });

      if (tutor) {
        const partialTutor: Partial<Tutor> = {
          googleId,
        };

        tutor = await this._tutorRepo.updateOneById(tutor.id!, partialTutor);
      } else {
        throw new NotFoundError(errorMessage.ACCOUNT_NOT_EXISTS);
      }
    }

    if (!tutor?.isVerified && !tutor?.rejectionReason)
      throw new ForbiddenError(errorMessage.UNVERIFIED);
    if (tutor?.rejectionReason) {
      throw new BadRequestError(
        `${errorMessage.REJECTED}-${tutor.rejectionReason}/${tutor.email}`,
      );
    }
    if (tutor?.isBlocked) {
      throw new ForbiddenError(errorMessage.BLOCKED);
    }

    const accessToken = this._tokenService.generateAuthToken({
      id: tutor?.id,
      role: 'tutor',
    });

    const refreshToken = this._tokenService.generateRefreshToken({
      id: tutor?.id,
      role: 'tutor',
    });

    return {
      tutor: TutorMapper.toResponse(tutor!),
      accessToken,
      refreshToken,
    };
  }
}
