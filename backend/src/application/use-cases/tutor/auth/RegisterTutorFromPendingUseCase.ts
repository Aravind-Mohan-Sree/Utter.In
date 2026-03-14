import { IRegisterTutorFromPendingUseCase } from '~use-case-interfaces/tutor/ITutorUseCase';
import { TutorMapper, TutorResponseDTO } from '~mappers/TutorMapper';
import { IPendingTutorRepository } from '~repository-interfaces/IPendingTutorRepository';
import { ITutorRepository } from '~repository-interfaces/ITutorRepository';
import { Tutor } from '~entities/Tutor';
import { InternalServerError, NotFoundError } from '~errors/HttpError';
import { errorMessage } from '~constants/errorMessage';

export class RegisterTutorFromPendingUseCase implements IRegisterTutorFromPendingUseCase {
  constructor(
    private _pendingTutorRepo: IPendingTutorRepository,
    private _tutorRepo: ITutorRepository,
  ) {}

  async execute(email: string): Promise<{
    pendingTutorId: string;
    newTutorId: string;
    tutor: TutorResponseDTO;
  }> {
    const pendingTutor = await this._pendingTutorRepo.findOneByField({ email });

    if (!pendingTutor) throw new NotFoundError('Tutor not found');

    const tutor = new Tutor(
      pendingTutor.name!,
      pendingTutor.email,
      pendingTutor.knownLanguages!,
      pendingTutor.yearsOfExperience!,
      'I am a Philologist!',
      pendingTutor.password!,
      null,
      'tutor',
      false,
      false,
      null,
      null,
    );

    const newTutor = await this._tutorRepo.create(tutor);

    if (!newTutor) throw new InternalServerError(errorMessage.SOMETHING_WRONG);

    return {
      pendingTutorId: pendingTutor.id!,
      newTutorId: newTutor.id!,
      tutor: TutorMapper.toResponse(newTutor),
    };
  }
}
