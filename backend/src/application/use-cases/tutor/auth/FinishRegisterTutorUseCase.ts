import { errorMessage } from '~constants/errorMessage';
import { FinishRegisterTutorDTO } from '~dtos/FinishRegisterTutorDTO';
import { Tutor } from '~entities/Tutor';
import { BadRequestError } from '~errors/HttpError';
import { IPendingTutorRepository } from '~repository-interfaces/IPendingTutorRepository';
import { ITutorRepository } from '~repository-interfaces/ITutorRepository';
import { IFinishRegisterTutorUseCase } from '~use-case-interfaces/tutor/ITutorUseCase';

export class FinishRegisterTutorUseCase implements IFinishRegisterTutorUseCase {
  constructor(
    private pendingTutorRepo: IPendingTutorRepository,
    private tutorRepo: ITutorRepository,
  ) {}

  async execute(
    data: FinishRegisterTutorDTO,
  ): Promise<{ oldId: string; newId: string }> {
    const { email, knownLanguages, yearsOfExperience } = data;
    const pendingTutor = await this.pendingTutorRepo.findOneByField({ email });

    if (!pendingTutor) throw new BadRequestError(errorMessage.SESSION_EXPIRED);

    let tutor = new Tutor(
      pendingTutor.name!,
      pendingTutor.email,
      knownLanguages,
      yearsOfExperience,
      'I am a Philologist!',
      ' ',
      null,
      'tutor',
      false,
      false,
      null,
      null,
    );

    tutor = await this.tutorRepo.create(tutor);

    return { oldId: pendingTutor.id!, newId: tutor.id! };
  }
}
