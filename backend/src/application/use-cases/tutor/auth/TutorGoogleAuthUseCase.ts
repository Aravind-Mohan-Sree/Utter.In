import { ITutorGoogleAuthUseCase } from '~use-case-interfaces/tutor/ITutorUseCase';
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

export class TutorGoogleAuthUseCase implements ITutorGoogleAuthUseCase {
  constructor(
    private tutorRepo: ITutorRepository,
    private tokenService: ITokenService,
  ) {}

  async execute(
    email: string,
    googleId: string,
  ): Promise<{
    tutor: TutorResponseDTO;
    accessToken: string;
    refreshToken: string;
  }> {
    let tutor = await this.tutorRepo.findOneByField({ googleId });

    if (!tutor) {
      tutor = await this.tutorRepo.findOneByField({ email });

      if (tutor) {
        const partialTutor: Partial<Tutor> = {
          googleId,
        };

        tutor = await this.tutorRepo.updateOneById(tutor.id!, partialTutor);
      } else {
        throw new NotFoundError(errorMessage.ACCOUNT_NOT_EXISTS);
      }
    }

    if (!tutor?.isVerified && !tutor?.rejectionReason)
      throw new ForbiddenError(errorMessage.UNVERIFIED);
    if (tutor?.rejectionReason)
      throw new BadRequestError(errorMessage.REJECTED);
    if (tutor?.isBlocked) {
      throw new ForbiddenError(errorMessage.BLOCKED);
    }

    const accessToken = this.tokenService.generateAuthToken({
      id: tutor?.id,
      role: 'tutor',
    });

    const refreshToken = this.tokenService.generateRefreshToken({
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
